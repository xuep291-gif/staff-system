import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const documents = new Hono();

// ── Types ──────────────────────────────────────────────────────────────────────
type DocStatus = 'pending' | 'first_pass' | 'department_review' | 'final_pass' | 'rejected';

interface MaterialItem {
  materialType: string;
  fileId: string;
  fileName: string;
  previewable: boolean;
  downloadable: boolean;
}

interface AuditLogEntry {
  operator: string;
  action: string;
  opinion: string;
  operatedAt: string;
}

interface DocReview {
  documentReviewId: string;
  studentId: string;
  studentNo: string;
  studentName: string;
  className: string;
  college: string;
  major: string;
  status: DocStatus;
  submittedAt: string;
  materials: MaterialItem[];
  auditLogs: AuditLogEntry[];
  rejectReason: string;
  rejectMaterialTypes: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────────
const MATERIAL_TYPES = ['id_card', 'admission_notice', 'household_register', 'photo'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: '待审核',
  first_pass: '初审通过',
  department_review: '院系审核中',
  final_pass: '终审通过',
  rejected: '已驳回',
};

// Who can advance a given status to the next stage
const STATUS_TRANSITIONS: Record<string, { roles: string[]; next: string }> = {
  pending:           { roles: ['teacher'],                         next: 'first_pass' },
  first_pass:        { roles: ['teacher', 'finance', 'government'], next: 'department_review' },
  department_review: { roles: ['finance', 'government'],           next: 'final_pass' },
};

const STATUSES: DocStatus[] = ['pending', 'first_pass', 'department_review', 'final_pass', 'rejected'];
const STATUS_WEIGHTS = [0.40, 0.22, 0.16, 0.14, 0.08]; // weighted random distribution

// Fallback students used when the DB is empty / unreachable
const FALLBACK_STUDENTS = [
  { id: '1',  student_no: '2024001', name: '张三', class_name: '计算机科学2024-1班', college_name: '计算机学院',       major: '计算机科学与技术' },
  { id: '2',  student_no: '2024002', name: '李四', class_name: '软件工程2024-1班',   college_name: '软件学院',         major: '软件工程' },
  { id: '3',  student_no: '2024003', name: '王五', class_name: '电子信息2024-1班',   college_name: '电子工程学院',     major: '电子信息工程' },
  { id: '4',  student_no: '2024004', name: '赵六', class_name: '数学2024-1班',       college_name: '数学学院',         major: '数学与应用数学' },
  { id: '5',  student_no: '2024005', name: '孙七', class_name: '物理2024-1班',       college_name: '物理学院',         major: '物理学' },
  { id: '6',  student_no: '2024006', name: '周八', class_name: '化学2024-1班',       college_name: '化学学院',         major: '化学' },
  { id: '7',  student_no: '2024007', name: '吴九', class_name: '生物2024-1班',       college_name: '生命科学学院',     major: '生物科学' },
  { id: '8',  student_no: '2024008', name: '郑十', class_name: '计算机科学2024-2班', college_name: '计算机学院',       major: '计算机科学与技术' },
  { id: '9',  student_no: '2024009', name: '刘十一', class_name: '软件工程2024-2班',  college_name: '软件学院',        major: '软件工程' },
  { id: '10', student_no: '2024010', name: '陈十二', class_name: '电子信息2024-2班',  college_name: '电子工程学院',    major: '电子信息工程' },
  { id: '11', student_no: '2024011', name: '杨十三', class_name: '英语2024-1班',      college_name: '外国语学院',      major: '英语' },
  { id: '12', student_no: '2024012', name: '黄十四', class_name: '法学2024-1班',      college_name: '法学院',          major: '法学' },
];

// ── In-memory store ────────────────────────────────────────────────────────────
const reviewStore = new Map<string, DocReview>();  // keyed by studentId
let storeSeeded = false;

// ── Helpers ────────────────────────────────────────────────────────────────────
function genDocReviewId(): string {
  return `DOC_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function genFileId(studentId: string, materialType: string): string {
  return `FILE_${studentId}_${materialType}_${Math.random().toString(36).slice(2, 6)}`;
}

function genMaterials(studentId: string): MaterialItem[] {
  return MATERIAL_TYPES.map((mt) => {
    const ext = mt === 'photo' ? 'jpg' : 'pdf';
    return {
      materialType: mt,
      fileId: genFileId(studentId, mt),
      fileName: `${mt}_${studentId}.${ext}`,
      previewable: true,
      downloadable: true,
    };
  });
}

function randomStatus(): DocStatus {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < STATUSES.length; i++) {
    cumulative += STATUS_WEIGHTS[i];
    if (r < cumulative) return STATUSES[i];
  }
  return 'pending';
}

function canApproveStatus(status: DocStatus, role: string): boolean {
  if (status === 'final_pass' || status === 'rejected') return false;
  const t = STATUS_TRANSITIONS[status];
  return t ? t.roles.includes(role) : false;
}

function canRejectStatus(status: DocStatus): boolean {
  return status !== 'final_pass' && status !== 'rejected';
}

function getNextStatus(current: DocStatus): string | null {
  const t = STATUS_TRANSITIONS[current];
  return t ? t.next : null;
}

// Seed the in-memory store from the database (or fallback data).
async function seedStore(): Promise<void> {
  if (storeSeeded) return;

  try {
    const rows = await db.execute(sql`
      SELECT s.id, s.student_no, s.name, s.major,
             cc.name AS class_name, co.name AS college_name
      FROM t_data_student s
      LEFT JOIN t_data_org_college_class cc ON s.class_id = cc.id
      LEFT JOIN t_data_college co ON cc.college_id = co.id
    `);

    const students = rows as any[];
    for (const s of students) {
      const sid = String(s.id);
      if (reviewStore.has(sid)) continue;
      const status = randomStatus();
      reviewStore.set(sid, {
        documentReviewId: genDocReviewId(),
        studentId: sid,
        studentNo: s.student_no || `STU${sid.padStart(6, '0')}`,
        studentName: s.name || '学生',
        className: s.class_name || '未分班',
        college: s.college_name || '未知学院',
        major: s.major || '未知专业',
        status,
        submittedAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 3600 * 1000)).toISOString(),
        materials: genMaterials(sid),
        auditLogs: status !== 'pending'
          ? [{
              operator: '系统管理员',
              action: '提交',
              opinion: '',
              operatedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000)).toISOString(),
            }]
          : [],
        rejectReason: status === 'rejected' ? '材料不符合要求，请根据驳回意见修改后重新提交' : '',
        rejectMaterialTypes: [],
      });
    }
  } catch {
    // DB unavailable — seed with fallback data
    for (const s of FALLBACK_STUDENTS) {
      if (reviewStore.has(s.id)) continue;
      const status = randomStatus();
      reviewStore.set(s.id, {
        documentReviewId: genDocReviewId(),
        studentId: s.id,
        studentNo: s.student_no,
        studentName: s.name,
        className: s.class_name,
        college: s.college_name,
        major: s.major,
        status,
        submittedAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 3600 * 1000)).toISOString(),
        materials: genMaterials(s.id),
        auditLogs: [],
        rejectReason: status === 'rejected' ? '材料不符合要求，请根据驳回意见修改后重新提交' : '',
        rejectMaterialTypes: [],
      });
    }
  }

  storeSeeded = true;
}

/** Look up a review by its documentReviewId (not studentId). */
function findReviewByDocId(documentReviewId: string): DocReview | undefined {
  for (const r of reviewStore.values()) {
    if (r.documentReviewId === documentReviewId) return r;
  }
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ── GET /documents/reviews — paginated document review list ───────────────────
documents.get('/documents/reviews', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  await seedStore();

  const status    = c.req.query('status');     // exact status filter
  const tab       = c.req.query('tab');        // pending | passed | rejected
  const classId   = c.req.query('classId');    // filter by class/college
  const keyword   = c.req.query('keyword');    // fuzzy search on name / studentNo
  const pageNum   = Math.max(1, parseInt(c.req.query('pageNum') || '1', 10));
  const pageSize  = Math.min(100, Math.max(1, parseInt(c.req.query('pageSize') || '10', 10)));

  let reviews = Array.from(reviewStore.values());

  // Tab filter (overrides raw status)
  if (tab === 'pending') {
    reviews = reviews.filter((r) => r.status !== 'final_pass' && r.status !== 'rejected');
  } else if (tab === 'passed') {
    reviews = reviews.filter((r) => r.status === 'final_pass');
  } else if (tab === 'rejected') {
    reviews = reviews.filter((r) => r.status === 'rejected');
  }

  // Exact status filter (ignored when tab is present)
  if (status && !tab) {
    reviews = reviews.filter((r) => r.status === status);
  }

  // Keyword search
  if (keyword) {
    const kw = keyword.toLowerCase();
    reviews = reviews.filter(
      (r) => r.studentName.toLowerCase().includes(kw) || r.studentNo.toLowerCase().includes(kw),
    );
  }

  // Class / college filter
  if (classId) {
    reviews = reviews.filter(
      (r) => r.className.includes(classId) || r.college.includes(classId),
    );
  }

  // Newest first
  reviews.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const total       = reviews.length;
  const totalPages  = Math.ceil(total / pageSize) || 1;
  const start       = (pageNum - 1) * pageSize;
  const paged       = reviews.slice(start, start + pageSize);

  const items = paged.map((r) => ({
    documentReviewId: r.documentReviewId,
    studentId:        r.studentId,
    studentNo:        r.studentNo,
    studentName:      r.studentName,
    className:        r.className,
    college:          r.college,
    major:            r.major,
    status:           r.status,
    statusLabel:      STATUS_LABELS[r.status] || r.status,
    submittedAt:      r.submittedAt,
    materialTags:     r.materials.map((m) => m.materialType),
    rejectReason:     r.rejectReason || undefined,
  }));

  return okCtx(c, { items, pageNum, pageSize, total, totalPages });
});

// ── GET /documents/reviews/:documentReviewId — detail ──────────────────────────
documents.get('/documents/reviews/:documentReviewId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  await seedStore();

  const documentReviewId = c.req.param('documentReviewId');
  const review = findReviewByDocId(documentReviewId);
  if (!review) return failCtx(c, '审核记录不存在', 40400, 404);

  // Enrich student info from DB when possible
  let student: Record<string, unknown> = {
    studentId:  review.studentId,
    studentNo:  review.studentNo,
    name:       review.studentName,
    className:  review.className,
    college:    review.college,
    major:      review.major,
  };

  try {
    const rows = await db.execute(sql`
      SELECT s.id, s.student_no, s.name, s.gender, s.phone, s.id_card,
             s.major, s.enrollment_year, s.checkin_status, s.dorm_status,
             cc.class_name, co.name AS college_name
      FROM t_data_student s
      LEFT JOIN t_data_org_college_class cc ON s.class_id = cc.id
      LEFT JOIN t_data_college co ON cc.college_id = co.id
      WHERE s.id = ${Number(review.studentId)}
      LIMIT 1
    `);
    const s = (rows as any[])[0];
    if (s) {
      student = {
        studentId:      String(s.id),
        studentNo:      s.student_no || review.studentNo,
        name:           s.name || review.studentName,
        gender:         s.gender ?? null,
        phone:          s.phone ?? null,
        idCard:         s.id_card ?? null,
        major:          s.major || review.major,
        enrollmentYear: s.enrollment_year ?? null,
        checkinStatus:  s.checkin_status ?? null,
        dormStatus:     s.dorm_status ?? null,
        className:      s.class_name || review.className,
        college:        s.college_name || review.college,
      };
    }
  } catch {
    // use the default student object built above
  }

  const currentStatus = review.status as DocStatus;

  return okCtx(c, {
    documentReviewId: review.documentReviewId,
    student,
    status:     review.status,
    materials:  review.materials,
    auditLogs:  review.auditLogs,
    canApprove: canApproveStatus(currentStatus, auth.role),
    canReject:  canRejectStatus(currentStatus),
  });
});

// ── POST /documents/reviews/:documentReviewId/approve ──────────────────────────
documents.post('/documents/reviews/:documentReviewId/approve', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  await seedStore();

  const documentReviewId = c.req.param('documentReviewId');
  const body = await c.req.json().catch(() => ({}));
  const { opinion, targetStatus } = (body || {}) as { opinion?: string; targetStatus?: string };

  const review = findReviewByDocId(documentReviewId);
  if (!review) return failCtx(c, '审核记录不存在', 40400, 404);

  const oldStatus = review.status;

  // Determine the new status
  let newStatus: string;
  if (targetStatus) {
    // Validate the explicit transition
    const rule = STATUS_TRANSITIONS[oldStatus];
    if (!rule || rule.next !== targetStatus) {
      return failCtx(
        c,
        `状态流转不正确：${oldStatus} 只能流转到 ${rule?.next || 'N/A'}，不能流转到 ${targetStatus}`,
        40001,
      );
    }
    if (!rule.roles.includes(auth.role)) {
      return failCtx(c, '您没有权限执行此操作', 40300, 403);
    }
    newStatus = targetStatus;
  } else {
    const next = getNextStatus(oldStatus as DocStatus);
    if (!next) return failCtx(c, '当前状态不可继续审批（已是终态）', 40001);

    const rule = STATUS_TRANSITIONS[oldStatus];
    if (!rule.roles.includes(auth.role)) {
      return failCtx(c, '您没有权限执行此操作', 40300, 403);
    }
    newStatus = next;
  }

  // Append audit log
  const auditEntry: AuditLogEntry = {
    operator:   auth.name || auth.workNo,
    action:     `审核通过 （${STATUS_LABELS[oldStatus] || oldStatus} → ${STATUS_LABELS[newStatus] || newStatus}）`,
    opinion:    opinion || '',
    operatedAt: new Date().toISOString(),
  };

  // Mutate store
  review.status = newStatus as DocStatus;
  review.rejectReason = '';
  review.auditLogs.push(auditEntry);
  reviewStore.set(review.studentId, review);

  // Aggregate statistics
  const all = Array.from(reviewStore.values());
  const statistics = {
    pending:  all.filter((r) => r.status !== 'final_pass' && r.status !== 'rejected').length,
    passed:   all.filter((r) => r.status === 'final_pass').length,
    rejected: all.filter((r) => r.status === 'rejected').length,
  };

  return okCtx(c, {
    documentReviewId: review.documentReviewId,
    oldStatus,
    newStatus,
    auditLog:   auditEntry,
    statistics,
    messageSent: true,
  }, '审核通过');
});

// ── POST /documents/reviews/:documentReviewId/reject ───────────────────────────
documents.post('/documents/reviews/:documentReviewId/reject', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  await seedStore();

  const documentReviewId = c.req.param('documentReviewId');
  const body = await c.req.json().catch(() => ({}));
  const { rejectReason, rejectMaterialTypes } = (body || {}) as {
    rejectReason?: string;
    rejectMaterialTypes?: string[];
  };

  if (!rejectReason) return failCtx(c, '驳回原因不能为空', 40001);

  const review = findReviewByDocId(documentReviewId);
  if (!review) return failCtx(c, '审核记录不存在', 40400, 404);

  if (!canRejectStatus(review.status as DocStatus)) {
    return failCtx(c, '当前状态不可驳回', 40001);
  }

  const oldStatus = review.status;
  const newStatus: DocStatus = 'rejected';

  const auditEntry: AuditLogEntry = {
    operator:   auth.name || auth.workNo,
    action:     `驳回 （${STATUS_LABELS[oldStatus] || oldStatus} → ${STATUS_LABELS[newStatus]}）`,
    opinion:    rejectReason,
    operatedAt: new Date().toISOString(),
  };

  review.status              = newStatus;
  review.rejectReason        = rejectReason;
  review.rejectMaterialTypes = rejectMaterialTypes || [];
  review.auditLogs.push(auditEntry);
  reviewStore.set(review.studentId, review);

  const all = Array.from(reviewStore.values());
  const statistics = {
    pending:  all.filter((r) => r.status !== 'final_pass' && r.status !== 'rejected').length,
    passed:   all.filter((r) => r.status === 'final_pass').length,
    rejected: all.filter((r) => r.status === 'rejected').length,
  };

  return okCtx(c, {
    documentReviewId: review.documentReviewId,
    oldStatus,
    newStatus,
    auditLog:   auditEntry,
    statistics,
    messageSent: true,
  }, '已驳回');
});

export default documents;
