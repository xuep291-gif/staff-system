import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const loans = new Hono();

// ── Constants ────────────────────────────────────────────────────────────────

const LOAN_TYPES = ['origin_place', 'campus'] as const;
const LOAN_TYPE_LABELS: Record<string, string> = {
  origin_place: '生源地贷款',
  campus: '校园地贷款',
};

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
  '财务打款/冲抵',
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

type LoanStatus = typeof ALL_STATUSES[number];

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

interface BillStatus {
  billId: string;
  billName: string;
  amount: number;
  status: string;
}

interface LoanRecord {
  loanId: string;
  applicationNo: string;
  studentId: string;
  studentNo: string;
  studentName: string;
  loanType: string;
  loanTypeLabel: string;
  amount: number;
  receiptNo: string;
  receiptVerified: boolean;
  status: LoanStatus;
  statusLabel: string;
  submittedAt: string;
  currentNode: string;
  student: StudentRecord;
  materials: { fileId: string; fileName: string; fileType: string }[];
  auditLogs: AuditLogEntry[];
  payout: PayoutRecord | null;
  billStatuses: BillStatus[];
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
const loanStore = new Map<string, LoanRecord>();

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
          id, student_no, name, class_name, college_name, college_id, class_id, phone
        FROM t_data_student
        WHERE delete_flag = 0
        LIMIT 80
      `,
    )) as any[];

    if (rows.length > 0) {
      students = rows.map((r: any) => ({
        id: String(r.id ?? ''),
        studentNo: r.student_no ?? `STU${Date.now()}`,
        name: r.name ?? '未知',
        className: r.class_name ?? '',
        department: r.college_name ?? '',
        departmentId: String(r.college_id ?? ''),
        classId: String(r.class_id ?? ''),
        phone: r.phone ?? '',
      }));
    }
  } catch {
    // fall through to mock generation
  }

  // If DB returned nothing, generate mock students
  if (students.length === 0) {
    const mockNames = [
      '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十',
      '钱一', '陈二', '刘明', '黄丽', '林强', '何静', '郭峰', '杨洋',
      '梁宇', '宋雨', '唐磊', '韩雪', '冯涛', '曹芳', '许刚', '沈敏',
      '曾伟', '彭娜', '潘龙', '袁媛', '邓凯', '崔洁', '苏博', '魏文',
      '蒋华', '蔡云', '贾雷', '丁琳', '薛涛', '叶倩', '阎武', '余秀',
      '潘越', '戴军', '夏冰', '钟勇', '汪艳', '田超', '任菲', '姜鹏',
      '范梅', '方杰', '石英', '姚瑞', '谭波', '廖婷', '邹翔', '熊丽',
      '金磊', '陆萍', '郝刚', '白晶', '崔亮', '康燕', '毛远', '邱玉',
      '秦峰', '江珊', '史健', '顾颖', '侯浩', '邵琪', '孟达', '龙慧',
      '万强', '段红', '雷猛', '钱坤', '汤圆', '尹军', '黎彬', '易欢',
    ];
    const depts = [
      { name: '计算机科学与技术学院', id: '1' },
      { name: '电子信息工程学院', id: '2' },
      { name: '机械工程学院', id: '3' },
      { name: '经济管理学院', id: '4' },
      { name: '外国语学院', id: '5' },
      { name: '数学与统计学院', id: '6' },
    ];
    const classes = [
      '软件工程2101班', '计算机科学2102班', '电子信息2101班',
      '机械设计2101班', '工商管理2101班', '英语2101班',
      '数学与应用数学2101班', '物联网工程2101班',
    ];

    for (let i = 0; i < 50; i++) {
      const dept = depts[i % depts.length];
      students.push({
        id: String(1000 + i),
        studentNo: `2024${String(i + 1).padStart(4, '0')}`,
        name: mockNames[i] ?? `学生${i + 1}`,
        className: classes[i % classes.length],
        department: dept.name,
        departmentId: dept.id,
        classId: String(i % classes.length + 1),
        phone: `138${String(randomInt(10000000, 99999999))}`,
      });
    }
  }

  // Generate loan applications from students
  const BASE_TIME = Date.now();
  const statusPool: LoanStatus[] = [
    'pending', 'pending', 'pending', 'pending',
    'first_pass', 'first_pass', 'first_pass',
    'review_pass', 'review_pass',
    'final_pass', 'final_pass',
    'payment_pending', 'payment_pending',
    'paid', 'paid',
    'completed', 'completed', 'completed',
    'rejected',
  ];

  const operatorNames = ['张老师', '李老师', '王处长', '赵处长', '刘会计', '陈财务'];
  const operatorRoles = ['teacher', 'teacher', 'government', 'government', 'finance', 'finance'];

  const banks = ['国家开发银行', '中国农业银行', '中国银行'];
  const billNames = [
    '2024学年学费',
    '2024学年住宿费',
    '2024学年教材费',
    '2024学年体检费',
  ];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const status = statusPool[i % statusPool.length];
    const loanType = LOAN_TYPES[i % LOAN_TYPES.length];
    const receiptNo =
      loanType === 'origin_place'
        ? `YD${new Date().getFullYear()}${String(i + 1).padStart(4, '0')}`
        : `XY${new Date().getFullYear()}${String(i + 1).padStart(4, '0')}`;
    const amount = loanType === 'origin_place' ? randomPick([6000, 8000, 10000, 12000]) : randomPick([5000, 6000, 8000]);

    const sid = String(i + 1).padStart(3, '0');
    const loanId = `LOAN_${BASE_TIME}_${sid}`;
    const applicationNo = `LON${new Date().getFullYear()}${String(i + 1).padStart(5, '0')}`;

    // Build audit logs based on status progression
    const auditLogs: AuditLogEntry[] = [];
    const submittedAt = new Date(
      BASE_TIME - randomInt(7, 30) * 86400000,
    ).toISOString();

    auditLogs.push({
      operator: student.name,
      operatorRole: 'student',
      action: '提交申请',
      opinion: `申请${LOAN_TYPE_LABELS[loanType]}，金额 ${amount} 元`,
      operatedAt: submittedAt,
    });

    // Progress tracking
    const progressOrder = [
      'pending',
      'first_pass',
      'review_pass',
      'final_pass',
      'payment_pending',
      'paid',
    ];
    const currentIdx = progressOrder.indexOf(status);
    const progressedCount =
      currentIdx >= 0
        ? currentIdx
        : status === 'completed'
          ? 6
          : status === 'rejected'
            ? 1
            : 0;

    const receiptVerified =
      status !== 'pending' && status !== 'rejected';

    if (progressedCount >= 1 || status === 'completed' || status === 'rejected') {
      // teacher初审
      if (progressedCount >= 1 || status === 'rejected') {
        const idx = i % 2;
        auditLogs.push({
          operator: operatorNames[idx],
          operatorRole: 'teacher',
          action:
            status === 'rejected' && progressedCount === 1 ? '驳回' : '初审通过',
          opinion:
            status === 'rejected' && progressedCount === 1
              ? '贷款材料不完整，回执单未提供'
              : '材料齐全，回执单已验证，建议通过',
          operatedAt: new Date(
            new Date(submittedAt).getTime() + randomInt(1, 3) * 86400000,
          ).toISOString(),
        });
      }
    }

    if (progressedCount >= 2 || status === 'completed') {
      // government复审
      const idx = 2 + (i % 2);
      auditLogs.push({
        operator: operatorNames[idx],
        operatorRole: 'government',
        action: '复审通过',
        opinion: '符合贷款条件，同意发放',
        operatedAt: new Date(
          new Date(submittedAt).getTime() + randomInt(4, 7) * 86400000,
        ).toISOString(),
      });
    }

    if (progressedCount >= 3 || status === 'completed') {
      // teacher终审
      auditLogs.push({
        operator: operatorNames[i % 2],
        operatorRole: 'teacher',
        action: '终审通过',
        opinion: `批准贷款金额 ${amount} 元，回执号 ${receiptNo}`,
        operatedAt: new Date(
          new Date(submittedAt).getTime() + randomInt(8, 12) * 86400000,
        ).toISOString(),
      });
    }

    // payout record
    let payout: PayoutRecord | null = null;
    const billStatuses: BillStatus[] = [];
    const isOffset = loanType === 'campus' && (i % 3 === 0); // some campus loans use offset

    if (
      status === 'paid' ||
      status === 'completed' ||
      status === 'payment_pending'
    ) {
      const payMethod = isOffset ? 'offset_bill' : 'bank_transfer';
      payout = {
        status:
          status === 'payment_pending'
            ? 'pending'
            : status === 'paid' || status === 'completed'
              ? 'paid'
              : 'pending',
        amount,
        method: payMethod,
        paidAt:
          status === 'paid' || status === 'completed'
            ? new Date(
                new Date(submittedAt).getTime() + randomInt(12, 16) * 86400000,
              ).toISOString()
            : '',
        operatorName: operatorNames[4],
      };

      const payIdx = 4 + (i % 2);
      if (status === 'paid' || status === 'completed') {
        const payLabel = isOffset ? '财务冲抵' : '财务打款';
        const payOpinion = isOffset
          ? `已冲抵相关账单，金额 ${amount} 元`
          : `已通过银行转账发放 ${amount} 元`;
        auditLogs.push({
          operator: operatorNames[payIdx],
          operatorRole: 'finance',
          action: payLabel,
          opinion: payOpinion,
          operatedAt: payout.paidAt,
        });
      }

      // Generate bill statuses for offset loans
      if (isOffset) {
        const offsetBills = billNames.slice(0, randomInt(1, 3));
        let remaining = amount;
        for (let b = 0; b < offsetBills.length; b++) {
          const billAmount =
            b === offsetBills.length - 1
              ? remaining
              : Math.min(remaining, randomPick([4800, 5000, 5600]));
          remaining -= billAmount;
          billStatuses.push({
            billId: `BILL_${BASE_TIME}_${sid}_${b}`,
            billName: offsetBills[b],
            amount: billAmount,
            status:
              status === 'paid' || status === 'completed' ? 'offset' : 'pending',
          });
        }
      }
    }

    const record: LoanRecord = {
      loanId,
      applicationNo,
      studentId: student.id,
      studentNo: student.studentNo,
      studentName: student.name,
      loanType,
      loanTypeLabel: LOAN_TYPE_LABELS[loanType],
      amount,
      receiptNo,
      receiptVerified:
        !(status === 'pending' || status === 'rejected'),
      status,
      statusLabel: STATUS_LABELS[status] ?? status,
      submittedAt,
      currentNode: CURRENT_NODE_MAP[status] ?? '',
      student,
      materials: [
        {
          fileId: `file_${loanId}_1`,
          fileName: '贷款申请表.pdf',
          fileType: 'pdf',
        },
        {
          fileId: `file_${loanId}_2`,
          fileName: '家庭经济困难证明.pdf',
          fileType: 'pdf',
        },
        {
          fileId: `file_${loanId}_3`,
          fileName:
            loanType === 'origin_place' ? '生源地贷款回执单.pdf' : '校园地贷款合同.pdf',
          fileType: 'pdf',
        },
        {
          fileId: `file_${loanId}_4`,
          fileName: '家长同意书.pdf',
          fileType: 'pdf',
        },
      ],
      auditLogs,
      payout,
      billStatuses,
    };

    loanStore.set(loanId, record);
  }

  storeInitialised = true;
}

// ── Helper: build progress steps for a given record ──────────────────────────

function buildProgressSteps(record: LoanRecord) {
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
      if (i === 4)
        return l.action === '财务打款' || l.action === '财务冲抵';
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

  for (const r of loanStore.values()) {
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

// ── GET /loans ───────────────────────────────────────────────────────────────
// Loan list

loans.get('/loans', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  await ensureStore();

  const role = c.req.query('role') || auth.role;
  const status = c.req.query('status') || '';
  const tab = c.req.query('tab') || ''; // todo / processing / done
  const keyword = (c.req.query('keyword') || '').trim().toLowerCase();
  const classId = c.req.query('classId') || '';
  const departmentId = c.req.query('departmentId') || '';
  const loanType = c.req.query('loanType') || ''; // origin_place / campus
  const pageNum = Math.max(
    1,
    parseInt(c.req.query('pageNum') || '1', 10) || 1,
  );
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(c.req.query('pageSize') || '10', 10) || 10),
  );

  let filtered = Array.from(loanStore.values());

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

  // Filter by loanType
  if (loanType && LOAN_TYPES.includes(loanType as any)) {
    filtered = filtered.filter((r) => r.loanType === loanType);
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
    loanId: r.loanId,
    studentId: r.studentId,
    studentNo: r.studentNo,
    studentName: r.studentName,
    loanType: r.loanType,
    loanTypeLabel: r.loanTypeLabel,
    amount: r.amount,
    receiptNo: r.receiptNo,
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

// ── GET /loans/:loanId ───────────────────────────────────────────────────────
// Loan detail

loans.get('/loans/:loanId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  await ensureStore();

  const loanId = c.req.param('loanId');
  const record = loanStore.get(loanId);
  if (!record) return failCtx(c, '贷款申请不存在', 40400, 404);

  const progressSteps = buildProgressSteps(record);

  return okCtx(c, {
    loanId: record.loanId,
    applicationNo: record.applicationNo,
    student: {
      studentId: record.student.id,
      studentNo: record.student.studentNo,
      name: record.student.name,
      className: record.student.className,
      department: record.student.department,
      phone: record.student.phone,
    },
    loanType: record.loanType,
    loanTypeLabel: record.loanTypeLabel,
    amount: record.amount,
    receiptNo: record.receiptNo,
    receiptVerified: record.receiptVerified,
    status: record.status,
    statusLabel: record.statusLabel,
    currentNode: record.currentNode,
    materials: record.materials,
    progressSteps,
    auditLogs: record.auditLogs,
    payout: record.payout,
    billStatuses: record.billStatuses,
  });
});

// ── POST /loans/:loanId/approve ──────────────────────────────────────────────
// Approve loan (teacher / government)

loans.post('/loans/:loanId/approve', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);
  if (
    !auth.roles.includes('teacher') &&
    !auth.roles.includes('government')
  ) {
    return failCtx(c, '无权限，仅教师和政务人员可审批', 40300, 403);
  }

  await ensureStore();

  const loanId = c.req.param('loanId');
  const record = loanStore.get(loanId);
  if (!record) return failCtx(c, '贷款申请不存在', 40400, 404);

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

  if (
    record.status !== 'pending' &&
    record.status !== 'first_pass' &&
    record.status !== 'review_pass'
  ) {
    return failCtx(c, `当前状态「${record.statusLabel}」不可审批`, 40001);
  }

  const body = await c.req.json().catch(() => ({}));
  const { opinion, verifiedReceiptNo, approvedAmount, targetStatus } = body as {
    opinion?: string;
    verifiedReceiptNo?: string;
    approvedAmount?: number;
    targetStatus?: string;
  };

  const oldStatus = record.status;
  let newStatus: string = '';

  if (targetStatus && ALL_STATUSES.includes(targetStatus as any)) {
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

  // Update receipt info if provided
  if (verifiedReceiptNo) {
    record.receiptNo = verifiedReceiptNo;
    record.receiptVerified = true;
  }
  if (record.status === 'pending') {
    record.receiptVerified = true;
  }

  // Apply approved amount if provided
  if (approvedAmount !== undefined && approvedAmount > 0) {
    record.amount = approvedAmount;
  }

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
        ? `批准贷款金额 ${record.amount} 元，回执号 ${record.receiptNo}`
        : verifiedReceiptNo
          ? `回执单号验证通过：${verifiedReceiptNo}`
          : '同意'),
    operatedAt: now,
  };

  record.auditLogs.push(auditLog);
  record.status = newStatus as LoanStatus;
  record.statusLabel = STATUS_LABELS[newStatus] ?? newStatus;
  record.currentNode = CURRENT_NODE_MAP[newStatus] ?? '';

  const stats = computeStatistics(actingRole ?? auth.role);

  return okCtx(c, {
    loanId,
    oldStatus,
    newStatus,
    auditLog,
    nextNode: record.currentNode,
    statistics: stats,
    messageSent: true,
  });
});

// ── POST /loans/:loanId/reject ───────────────────────────────────────────────
// Reject loan (teacher / government)

loans.post('/loans/:loanId/reject', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);
  if (
    !auth.roles.includes('teacher') &&
    !auth.roles.includes('government')
  ) {
    return failCtx(c, '无权限，仅教师和政务人员可驳回', 40300, 403);
  }

  await ensureStore();

  const loanId = c.req.param('loanId');
  const record = loanStore.get(loanId);
  if (!record) return failCtx(c, '贷款申请不存在', 40400, 404);

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

  const stats = computeStatistics(auth.role);

  return okCtx(c, {
    loanId,
    oldStatus,
    newStatus: 'rejected',
    auditLog,
    statistics: stats,
    messageSent: true,
  });
});

// ── POST /loans/:loanId/disburse ─────────────────────────────────────────────
// Finance disburse / offset bill

loans.post('/loans/:loanId/disburse', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);
  if (!auth.roles.includes('finance')) {
    return failCtx(c, '无权限，仅财务人员可执行打款/冲抵', 40300, 403);
  }

  await ensureStore();

  const loanId = c.req.param('loanId');
  const record = loanStore.get(loanId);
  if (!record) return failCtx(c, '贷款申请不存在', 40400, 404);

  if (record.status !== 'final_pass' && record.status !== 'payment_pending') {
    return failCtx(
      c,
      `当前状态「${record.statusLabel}」不可打款/冲抵，需先完成终审`,
      40001,
    );
  }

  const body = await c.req.json().catch(() => ({}));
  const { amount, payoutMethod, billIds, remark } = body as {
    amount?: number;
    payoutMethod?: string;
    billIds?: string[];
    remark?: string;
  };

  if (!amount || amount <= 0) {
    return failCtx(c, '金额（amount）必须大于 0', 40001);
  }

  if (
    !payoutMethod ||
    !['bank_transfer', 'offset_bill'].includes(payoutMethod)
  ) {
    return failCtx(
      c,
      '打款方式（payoutMethod）必须为 bank_transfer / offset_bill',
      40001,
    );
  }

  const now = new Date().toISOString();
  const payoutRecordId = `PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const payoutMethodLabel =
    payoutMethod === 'bank_transfer' ? '银行转账' : '冲抵账单';

  // Handle bill offset
  const billStatuses: BillStatus[] = [];
  if (payoutMethod === 'offset_bill') {
    if (billIds && billIds.length > 0) {
      const billNames = [
        '2024学年学费',
        '2024学年住宿费',
        '2024学年教材费',
        '2024学年体检费',
      ];
      let remaining = amount;
      for (let i = 0; i < billIds.length; i++) {
        const billAmount =
          i === billIds.length - 1 ? remaining : Math.floor(amount / billIds.length);
        remaining -= billAmount;
        billStatuses.push({
          billId: billIds[i],
          billName: billNames[i % billNames.length],
          amount: billAmount,
          status: 'offset',
        });
      }
    } else {
      // Default: offset against tuition
      billStatuses.push({
        billId: `BILL_${Date.now()}_001`,
        billName: '2024学年学费',
        amount,
        status: 'offset',
      });
    }
  }

  record.payout = {
    status: 'paid',
    amount,
    method: payoutMethod,
    paidAt: now,
    operatorName: auth.name,
  };

  record.billStatuses = billStatuses;

  const actionLabel =
    payoutMethod === 'offset_bill' ? '财务冲抵' : '财务打款';
  const opinionDetail =
    payoutMethod === 'offset_bill'
      ? `已冲抵相关账单，金额 ${amount} 元`
      : `已通过银行转账发放 ${amount} 元`;

  const auditLog: AuditLogEntry = {
    operator: auth.name,
    operatorRole: 'finance',
    action: actionLabel,
    opinion: remark || opinionDetail,
    operatedAt: now,
  };

  record.auditLogs.push(auditLog);
  record.status = 'completed';
  record.statusLabel = STATUS_LABELS.completed;
  record.currentNode = '';

  return okCtx(c, {
    loanId,
    status: 'completed',
    payoutRecordId,
    billStatuses,
    paidAt: now,
    messageSent: true,
  });
});

export default loans;
