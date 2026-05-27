import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';
import { getEavRows } from '../../lib/eav.js';

const orientation = new Hono();

// API-007: GET /api/student/orientation/status — 迎新状态
orientation.get('/api/student/orientation/status', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const students = await db.execute(sql`
    SELECT * FROM t_data_student WHERE student_no = ${auth.sid} AND disabled = '0' LIMIT 1
  `);
  const s = (students as any[])[0] || {};

  // Check billing for payment status
  const bills = await db.execute(sql`
    SELECT pay_status FROM t_data_billing WHERE student_no = ${auth.sid}
  `);
  const allPaid = (bills as any[]).length > 0 && (bills as any[]).every((b: any) => b.pay_status === 'paid');

  return okCtx(c, {
    status: 'pending',
    completedSteps: 0,
    location: null,
    qrCode: null,
    progressPercent: 0,
    overdueAmount: 0,
    paidAmount: 0,
  });
});

// API-008: GET /api/student/orientation/documents — 已上传材料
orientation.get('/api/student/orientation/documents', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const docTypes = ['id_card_front', 'id_card_back', 'admission_letter', 'household_main', 'household_personal', 'id_photo'];
  const documents: Record<string, { uploaded: boolean; fileId: string | null; fileName: string | null; uploadTime: string | null }> = {};
  for (const dt of docTypes) {
    documents[dt] = { uploaded: false, fileId: null, fileName: null, uploadTime: null };
  }

  return okCtx(c, { documents, submitted: false });
});

// API-009: POST /api/student/orientation/upload-document — 上传材料
orientation.post('/api/student/orientation/upload-document', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const body = await c.req.parseBody().catch(() => ({})) as Record<string, string>;
  const docType = body.docType;
  const fileId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return okCtx(c, { fileId, docType, fileName: `file_${docType}.jpg`, url: `/uploads/${fileId}` });
});

// API-010: POST /api/student/orientation/submit-documents — 提交全部材料
orientation.post('/api/student/orientation/submit-documents', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  return okCtx(c, null, '提交成功');
});

// API-011: GET /api/student/orientation/review-status — 审核状态
orientation.get('/api/student/orientation/review-status', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  return okCtx(c, { reviewStatus: 'pending', reviewTime: null, remark: null });
});

// === Deprecated API compatibility ===

// Legacy: POST /api/student/orientation/upload-id → redirect to upload-document
orientation.post('/api/student/orientation/upload-id', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);
  const body = await c.req.parseBody().catch(() => ({})) as Record<string, string>;
  const docType = body.docType || 'id_card_front';
  const fileId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return okCtx(c, { fileId, docType, fileName: `file_${docType}.jpg`, url: `/uploads/${fileId}` });
});

// Legacy: POST /api/student/orientation/submit → redirect to submit-documents
orientation.post('/api/student/orientation/submit', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);
  return okCtx(c, null, '提交成功');
});

export default orientation;
