import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const scholarships = new Hono();

// ── Constants ────────────────────────────────────────────────────────────────

const SCHOLARSHIP_TYPES = [
  '国家助学金（一等）',
  '国家助学金（二等）',
  '学校困难补助',
  '社会助学金',
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: '待初审',
  first_pass: '初审通过',
  review_pass: '复审通过',
  final_pass: '终审通过',
  payment_pending: '待打款',
  paid: '已打款',
  completed: '已完成',
  rejected: '已驳回',
};

const PROGRESS_STEPS = [
  '提交申请',
  '教师初审',
  '政务复审',
  '教师终审',
  '财务打款',
  '完成',
];

const CURRENT_NODE_MAP: Record<string, string> = {
  pending: 'teacher_review',
  first_pass: 'government_review',
  review_pass: 'teacher_review',
  final_pass: 'finance_disburse',
  payment_pending: 'finance_disburse',
  paid: '',
  completed: '',
  rejected: '',
};

const ALL_STATUSES = [
  'pending',
  'first_pass',
  'review_pass',
  'final_pass',
  'payment_pending',
  'paid',
  'completed',
  'rejected',
] as const;

type ScholarshipStatus = typeof ALL_STATUSES[number];

// ── Helpers ──────────────────────────────────────────────────────────────────

function canProcessStatus(role: string, status: string): boolean {
  if (role === 'teacher' && (status === 'pending' || status === 'review_pass'))
    return true;
  if (role === 'government' && status === 'first_pass') return true;
  if (
    role === 'finance' &&
    (status === 'final_pass' || status === 'payment_pending')
  )
    return true;
  return false;
}

interface StudentRecord {
  id: string;
  studentNo: string;
  name: string;
  className: string;
  department: string;
  departmentId: string;
  classId: string;
  phone: string;
}

interface ScholarshipRecord {
  scholarshipId: string;
  applicationNo: string;
  studentId: string;
  studentNo: string;
  studentName: string;
  type: string;
  amount: number;
  approvedAmount: number;
  status: ScholarshipStatus;
  statusLabel: string;
  submittedAt: string;
  currentNode: string;
  student: StudentRecord;
  familySize: number;
  familyMembers: string;
  familyIncome: string;
  difficultyLevel: string;
  reason: string;
  applyDate: string;
  materials: { fileId: string; fileName: string; fileType: string }[];
  proofFileUrl: string;
  householdFileUrl: string;
  auditLogs: AuditLogEntry[];
  payout: PayoutRecord | null;
}

interface AuditLogEntry {
  operator: string;
  operatorRole: string;
  action: string;
  opinion: string;
  operatedAt: string;
}

interface PayoutRecord {
  status: string;
  amount: number;
  method: string;
  paidAt: string;
  operatorName: string;
  bankAccountId?: string;
}

// ── In-memory store (lazy-initialised) ───────────────────────────────────────

let storeInitialised = false;
const scholarshipStore = new Map<string, ScholarshipRecord>();

function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function ensureStore(): Promise<void> {
  if (storeInitialised) return;

  // Try to pull real students from the DB
  let students: StudentRecord[] = [];
  try {
    const rows = (await db.execute(
      sql`
        SELECT
          id, student_no, name, class_name, class_id, phone
        FROM t_data_student
        LIMIT 80
      `,
    )) as any[];

    if (rows.length > 0) {
      students = rows.map((r: any) => ({
        id: String(r.id ?? ''),
        studentNo: r.student_no ?? `STU${Date.now()}`,
        name: r.name ?? '未知',
        className: r.class_name ?? '',
        department: '',
        departmentId: '',
        classId: String(r.class_id ?? ''),
        phone: r.phone ?? '',
      }));
    }
  } catch {
    // fall through to mock generation
  }

// Load scholarship applications from DB
  try {
    const appRows = (await db.execute(sql`
      SELECT a.*, s.name AS student_name, s.class_name, s.phone AS student_phone
      FROM t_data_scholarship_application a
      LEFT JOIN t_data_student s ON a.student_no = s.student_no
      ORDER BY a.id
    `)) as any[];

    for (const r of appRows) {
      const student: StudentRecord = {
        id: String(r.student_no ?? ''),
        studentNo: r.student_no ?? '',
        name: r.student_name ?? '未知',
        className: r.class_name ?? '',
        department: '',
        departmentId: '',
        classId: '',
        phone: r.student_phone ?? '',
      };
      const status: ScholarshipStatus = (r.status as ScholarshipStatus) ?? 'pending';
      const record: ScholarshipRecord = {
        scholarshipId: r.application_id ?? `SCO_${Date.now()}`,
        applicationNo: r.application_id ?? '',
        studentId: student.id,
        studentNo: student.studentNo,
        studentName: student.name,
        type: r.type ?? '国家助学金（一等）',
        amount: Number(r.amount ?? 0),
        approvedAmount: status === 'pending' || status === 'rejected' ? 0 : Number(r.amount ?? 0),
        status,
        statusLabel: STATUS_LABELS[status] ?? status,
        submittedAt: r.created_at ?? new Date().toISOString(),
        currentNode: r.current_node ?? CURRENT_NODE_MAP[status] ?? '',
        student,
        familySize: Number(r.family_size ?? 0),
        familyMembers: r.family_members ?? '',
        familyIncome: String(r.income ?? ''),
        difficultyLevel: r.level ?? '',
        reason: r.reason ?? '',
        applyDate: r.apply_date ?? '',
        proofFileUrl: r.proof_file_url ?? '',
        householdFileUrl: r.household_file_url ?? '',
        materials: [],
        auditLogs: Array.isArray(r.audit_logs) ? r.audit_logs : [],
        payout: r.payout ?? null,
      };
      scholarshipStore.set(record.scholarshipId, record);
    }
  } catch(e) {
    console.error('Failed to load scholarships from DB:', e);
  }

  storeInitialised = true;
}

async function syncNewFromDB() {
  try {
    const appRows = (await db.execute(sql`
      SELECT a.*, s.name AS student_name, s.class_name, s.phone AS student_phone
      FROM t_data_scholarship_application a
      LEFT JOIN t_data_student s ON a.student_no = s.student_no
      WHERE a.application_id NOT IN ${sql(scholarshipStore.size > 0 ? [...scholarshipStore.keys()] : [''])}
      ORDER BY a.id
    `)) as any[];
    for (const r of appRows) {
      const student: StudentRecord = {
        id: String(r.student_no ?? ''), studentNo: r.student_no ?? '',
        name: r.student_name ?? '未知', className: r.class_name ?? '',
        department: '', departmentId: '', classId: '', phone: r.student_phone ?? '',
      };
      const st: ScholarshipStatus = (r.status as ScholarshipStatus) ?? 'pending';
      const record: ScholarshipRecord = {
        scholarshipId: r.application_id ?? `SCO_${Date.now()}`, applicationNo: r.application_id ?? '',
        studentId: student.id, studentNo: student.studentNo, studentName: student.name,
        type: r.type ?? '国家助学金（一等）', amount: Number(r.amount ?? 0),
        approvedAmount: st === 'pending' || st === 'rejected' ? 0 : Number(r.amount ?? 0),
        status: st, statusLabel: STATUS_LABELS[st] ?? st,
        submittedAt: r.created_at ?? new Date().toISOString(), currentNode: r.current_node ?? CURRENT_NODE_MAP[st] ?? '',
        student, familySize: Number(r.family_size ?? 0), familyMembers: r.family_members ?? '',
        familyIncome: String(r.income ?? ''), difficultyLevel: r.level ?? '',
        reason: r.reason ?? '', applyDate: r.apply_date ?? '', proofFileUrl: r.proof_file_url ?? '', householdFileUrl: r.household_file_url ?? '', materials: [],
        auditLogs: Array.isArray(r.audit_logs) ? r.audit_logs : [], payout: r.payout ?? null,
      };
      scholarshipStore.set(record.scholarshipId, record);
    }
  } catch(e) { console.error('syncNewFromDB failed:', e); }
}

// ── Helper: build progress steps for a given record ──────────────────────────

function buildProgressSteps(record: ScholarshipRecord) {
  const statusIdx: Record<string, number> = {
    pending: 0,
    first_pass: 1,
    review_pass: 2,
    final_pass: 3,
    payment_pending: 4,
    paid: 5,
    completed: 5,
  };

  const currentIdx =
    record.status === 'rejected' ? -1 : (statusIdx[record.status] ?? 0);

  return PROGRESS_STEPS.map((label, i) => {
    let stepStatus: 'done' | 'active' | 'pending';
    if (record.status === 'rejected') {
      stepStatus = i === 0 ? 'done' : 'pending';
    } else if (i < currentIdx) {
      stepStatus = 'done';
    } else if (i === currentIdx) {
      stepStatus = 'active';
    } else {
      stepStatus = 'pending';
    }

    const logForStep = record.auditLogs.find((l) => {
      if (i === 0) return l.action === '提交申请';
      if (i === 1) return l.action === '初审通过' || l.action === '驳回';
      if (i === 2) return l.action === '复审通过';
      if (i === 3) return l.action === '终审通过';
      if (i === 4) return l.action === '财务打款';
      return false;
    });

    return {
      step: i + 1,
      label,
      status: stepStatus,
      operator: logForStep?.operator ?? '',
      operatedAt: logForStep?.operatedAt ?? '',
    };
  });
}

// ── Helper: compute statistics ───────────────────────────────────────────────

function computeStatistics(role: string) {
  let pending = 0;
  let processing = 0;
  let done = 0;

  for (const r of scholarshipStore.values()) {
    if (r.status === 'rejected' || r.status === 'completed') {
      done++;
    } else if (canProcessStatus(role, r.status)) {
      pending++;
    } else {
      processing++;
    }
  }

  return { pending, processing, done };
}

// ── GET /scholarships ────────────────────────────────────────────────────────
// Scholarship application list

scholarships.get('/scholarships', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  await ensureStore();

  const role = c.req.query('role') || auth.role;
  const status = c.req.query('status') || '';
  const tab = c.req.query('tab') || ''; // todo / processing / done
  const keyword = (c.req.query('keyword') || '').trim().toLowerCase();
  const classId = c.req.query('classId') || '';
  const departmentId = c.req.query('departmentId') || '';
  const pageNum = Math.max(1, parseInt(c.req.query('pageNum') || '1', 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(c.req.query('pageSize') || '10', 10) || 10),
  );

  let filtered = Array.from(scholarshipStore.values());

  // Filter by status
  if (status && ALL_STATUSES.includes(status as any)) {
    filtered = filtered.filter((r) => r.status === status);
  }

  // Filter by tab (role-aware)
  if (tab === 'todo') {
    filtered = filtered.filter((r) => canProcessStatus(role, r.status));
  } else if (tab === 'processing') {
    filtered = filtered.filter(
      (r) =>
        !canProcessStatus(role, r.status) &&
        r.status !== 'rejected' &&
        r.status !== 'completed',
    );
  } else if (tab === 'done') {
    filtered = filtered.filter(
      (r) => r.status === 'completed' || r.status === 'rejected',
    );
  }

  // Filter by keyword (student name or number)
  if (keyword) {
    filtered = filtered.filter(
      (r) =>
        r.studentName.toLowerCase().includes(keyword) ||
        r.studentNo.toLowerCase().includes(keyword),
    );
  }

  // Filter by classId
  if (classId) {
    filtered = filtered.filter((r) => r.student.classId === classId);
  }

  // Filter by departmentId
  if (departmentId) {
    filtered = filtered.filter(
      (r) => r.student.departmentId === departmentId,
    );
  }

  // Sort by submission time descending
  filtered.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (pageNum - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const items = paged.map((r) => ({
    scholarshipId: r.scholarshipId,
    studentId: r.studentId,
    studentNo: r.studentNo,
    studentName: r.studentName,
    type: r.type,
    amount: r.amount,
    approvedAmount: r.approvedAmount,
    status: r.status,
    statusLabel: r.statusLabel,
    submittedAt: r.submittedAt,
    currentNode: r.currentNode,
    canProcess: canProcessStatus(role, r.status),
  }));

  return okCtx(c, {
    items,
    total,
    pageNum,
    pageSize,
    totalPages,
  });
});

// ── GET /scholarships/:scholarshipId ─────────────────────────────────────────
// Scholarship detail

scholarships.get('/scholarships/:scholarshipId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  await ensureStore();

  const scholarshipId = c.req.param('scholarshipId');
  const record = scholarshipStore.get(scholarshipId);
  if (!record) return failCtx(c, '助学金申请不存在', 40400, 404);

  const progressSteps = buildProgressSteps(record);

  return okCtx(c, {
    scholarshipId: record.scholarshipId,
    applicationNo: record.applicationNo,
    student: {
      studentId: record.student.id,
      studentNo: record.student.studentNo,
      name: record.student.name,
      className: record.student.className,
      department: record.student.department,
      phone: record.student.phone,
    },
    type: record.type,
    amount: record.amount,
    approvedAmount: record.approvedAmount,
    status: record.status,
    statusLabel: record.statusLabel,
    currentNode: record.currentNode,
    familySize: record.familySize,
    familyMembers: record.familyMembers,
    familyIncome: record.familyIncome,
    difficultyLevel: record.difficultyLevel,
    reason: record.reason,
    applyDate: record.applyDate,
    proofFileUrl: record.proofFileUrl,
    householdFileUrl: record.householdFileUrl,
    materials: record.materials,
    progressSteps,
    auditLogs: record.auditLogs,
    payout: record.payout,
  });
});

// ── POST /scholarships/:scholarshipId/approve ────────────────────────────────
// Approve scholarship (teacher / government)

scholarships.post('/scholarships/:scholarshipId/approve', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);
  if (
    !auth.roles.includes('teacher') &&
    !auth.roles.includes('government')
  ) {
    return failCtx(c, '无权限，仅教师和政务人员可审批', 40300, 403);
  }

  await ensureStore();

  const scholarshipId = c.req.param('scholarshipId');
  const record = scholarshipStore.get(scholarshipId);
  if (!record) return failCtx(c, '助学金申请不存在', 40400, 404);

  // Determine which role we are acting as
  const actingRole =
    auth.roles.includes('teacher') &&
    (record.status === 'pending' || record.status === 'review_pass')
      ? 'teacher'
      : auth.roles.includes('government') && record.status === 'first_pass'
        ? 'government'
        : null;

  if (!actingRole) {
    if (!canProcessStatus(auth.role, record.status)) {
      return failCtx(
        c,
        `当前申请状态为「${record.statusLabel}」，您没有权限审批`,
        40301,
      );
    }
  }

  // Only allow approval when status is actionable
  if (
    record.status !== 'pending' &&
    record.status !== 'first_pass' &&
    record.status !== 'review_pass'
  ) {
    return failCtx(c, `当前状态「${record.statusLabel}」不可审批`, 40001);
  }

  const body = await c.req.json().catch(() => ({}));
  const { opinion, approvedAmount, targetStatus } = body as {
    opinion?: string;
    approvedAmount?: number;
    targetStatus?: string;
  };

  const oldStatus = record.status;
  let newStatus: string = '';

  if (targetStatus && ALL_STATUSES.includes(targetStatus as any)) {
    // Allow explicit target if it makes sense for the role
    if (
      auth.roles.includes('teacher') &&
      (targetStatus === 'first_pass' || targetStatus === 'final_pass')
    ) {
      newStatus = targetStatus;
    } else if (
      auth.roles.includes('government') &&
      targetStatus === 'review_pass'
    ) {
      newStatus = targetStatus;
    }
  }

  if (!newStatus) {
    // Default transition
    if (record.status === 'pending') {
      newStatus = 'first_pass';
    } else if (record.status === 'first_pass') {
      newStatus = 'review_pass';
    } else if (record.status === 'review_pass') {
      newStatus = 'final_pass';
    }
  }

  if (!newStatus) {
    return failCtx(c, '无法确定目标状态', 40001);
  }

  // Apply approved amount if provided
  if (approvedAmount !== undefined && approvedAmount > 0) {
    record.approvedAmount = approvedAmount;
  } else if (record.approvedAmount === 0) {
    record.approvedAmount = record.amount;
  }

  // Determine action label
  const actionLabel =
    newStatus === 'first_pass'
      ? '初审通过'
      : newStatus === 'review_pass'
        ? '复审通过'
        : newStatus === 'final_pass'
          ? '终审通过'
          : '审批通过';

  const now = new Date().toISOString();
  const auditLog: AuditLogEntry = {
    operator: auth.name,
    operatorRole: actingRole ?? auth.role,
    action: actionLabel,
    opinion:
      opinion ||
      (newStatus === 'final_pass'
        ? `批准资助金额 ${record.approvedAmount} 元`
        : '同意'),
    operatedAt: now,
  };

  record.auditLogs.push(auditLog);
  record.status = newStatus as ScholarshipStatus;
  record.statusLabel = STATUS_LABELS[newStatus] ?? newStatus;
  record.currentNode = CURRENT_NODE_MAP[newStatus] ?? '';

  // Persist to DB
  try {
    await db.execute(sql`
      UPDATE t_data_scholarship_application
      SET status = ${newStatus}, current_node = ${record.currentNode},
          audit_logs = ${JSON.stringify(record.auditLogs)}::jsonb,
          updated_at = now()
      WHERE application_id = ${scholarshipId}
    `);
  } catch {}

  const stats = computeStatistics(actingRole ?? auth.role);

  return okCtx(c, {
    scholarshipId,
    oldStatus,
    newStatus,
    auditLog,
    nextNode: record.currentNode,
    statistics: stats,
    messageSent: true,
  });
});

// ── POST /scholarships/:scholarshipId/reject ─────────────────────────────────
// Reject scholarship (teacher / government)

scholarships.post('/scholarships/:scholarshipId/reject', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);
  if (
    !auth.roles.includes('teacher') &&
    !auth.roles.includes('government')
  ) {
    return failCtx(c, '无权限，仅教师和政务人员可驳回', 40300, 403);
  }

  await ensureStore();

  const scholarshipId = c.req.param('scholarshipId');
  const record = scholarshipStore.get(scholarshipId);
  if (!record) return failCtx(c, '助学金申请不存在', 40400, 404);

  if (record.status === 'completed' || record.status === 'rejected') {
    return failCtx(c, `当前状态「${record.statusLabel}」不可驳回`, 40001);
  }

  const body = await c.req.json().catch(() => ({}));
  const { opinion, rejectReason } = body as {
    opinion?: string;
    rejectReason?: string;
  };

  if (!rejectReason) {
    return failCtx(c, '驳回原因（rejectReason）不能为空', 40001);
  }

  const oldStatus = record.status;
  const now = new Date().toISOString();
  const auditLog: AuditLogEntry = {
    operator: auth.name,
    operatorRole: auth.role,
    action: '驳回',
    opinion: opinion || rejectReason,
    operatedAt: now,
  };

  record.auditLogs.push(auditLog);
  record.status = 'rejected';
  record.statusLabel = STATUS_LABELS.rejected;
  record.currentNode = '';

  // Persist to DB
  try {
    await db.execute(sql`
      UPDATE t_data_scholarship_application
      SET status = 'rejected', current_node = '',
          audit_logs = ${JSON.stringify(record.auditLogs)}::jsonb,
          updated_at = now()
      WHERE application_id = ${scholarshipId}
    `);
  } catch {}

  const stats = computeStatistics(auth.role);

  return okCtx(c, {
    scholarshipId,
    oldStatus,
    newStatus: 'rejected',
    auditLog,
    statistics: stats,
    messageSent: true,
  });
});

// ── POST /scholarships/:scholarshipId/disburse ───────────────────────────────
// Finance disburse

scholarships.post('/scholarships/:scholarshipId/disburse', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);
  if (!auth.roles.includes('finance')) {
    return failCtx(c, '无权限，仅财务人员可执行打款', 40300, 403);
  }

  await ensureStore();

  const scholarshipId = c.req.param('scholarshipId');
  const record = scholarshipStore.get(scholarshipId);
  if (!record) return failCtx(c, '助学金申请不存在', 40400, 404);

  if (record.status !== 'final_pass' && record.status !== 'payment_pending') {
    return failCtx(
      c,
      `当前状态「${record.statusLabel}」不可打款，需先完成终审`,
      40001,
    );
  }

  const body = await c.req.json().catch(() => ({}));
  const { amount, payoutMethod, bankAccountId, remark } = body as {
    amount?: number;
    payoutMethod?: string;
    bankAccountId?: string;
    remark?: string;
  };

  if (!amount || amount <= 0) {
    return failCtx(c, '打款金额（amount）必须大于 0', 40001);
  }

  if (
    !payoutMethod ||
    !['bank_transfer', 'cash', 'offset_bill'].includes(payoutMethod)
  ) {
    return failCtx(
      c,
      '打款方式（payoutMethod）必须为 bank_transfer / cash / offset_bill',
      40001,
    );
  }

  const now = new Date().toISOString();
  const payoutRecordId = `PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  record.payout = {
    status: 'paid',
    amount,
    method: payoutMethod,
    paidAt: now,
    operatorName: auth.name,
    ...(bankAccountId ? { bankAccountId } : {}),
  };

  // Persist to DB
  try {
    await db.execute(sql`
      UPDATE t_data_scholarship_application
      SET status = 'completed', current_node = '',
          payout = ${JSON.stringify(record.payout)}::jsonb,
          audit_logs = ${JSON.stringify(record.auditLogs)}::jsonb,
          updated_at = now()
      WHERE application_id = ${scholarshipId}
    `);
  } catch {}

  const payoutMethodLabel =
    payoutMethod === 'bank_transfer'
      ? '银行转账'
      : payoutMethod === 'cash'
        ? '现金发放'
        : '冲抵账单';

  const auditLog: AuditLogEntry = {
    operator: auth.name,
    operatorRole: 'finance',
    action: '财务打款',
    opinion:
      remark ||
      `通过${payoutMethodLabel}发放 ${amount} 元${
        bankAccountId ? `，账号 ${bankAccountId}` : ''
      }`,
    operatedAt: now,
  };

  record.auditLogs.push(auditLog);
  record.approvedAmount = amount;
  record.status = 'completed';
  record.statusLabel = STATUS_LABELS.completed;
  record.currentNode = '';

  return okCtx(c, {
    scholarshipId,
    status: 'completed',
    payoutRecordId,
    paidAt: now,
    messageSent: true,
  });
});

export default scholarships;
