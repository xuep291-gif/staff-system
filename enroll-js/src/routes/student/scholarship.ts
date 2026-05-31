import { Hono } from 'hono';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';

const scholarship = new Hono();

// API-031: GET /api/student/scholarship/types
scholarship.get('/api/student/scholarship/types', async (c) => {
  return okCtx(c, {
    types: [
      { id: 1, name: '国家助学金（一等）', maxAmount: 5000, description: '家庭经济困难学生，品学兼优' },
      { id: 2, name: '国家助学金（二等）', maxAmount: 3000, description: '家庭经济困难学生' },
      { id: 3, name: '学校困难补助', maxAmount: 2000, description: '学校认定的家庭困难学生' },
      { id: 4, name: '社会助学金', maxAmount: 10000, description: '由社会爱心人士/企业资助' },
    ],
  });
});

// API-032: POST /api/student/scholarship/apply
scholarship.post('/api/student/scholarship/apply', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { type, familySize, familyMembers, income, level, date, phone, reason } = await c.req.json().catch(() => ({}));
  if (!type || !familySize || !familyMembers || !income || !level || !date || !phone || !reason) {
    return failCtx(c, '请填写完整的申请信息');
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) return failCtx(c, '手机号格式不正确');
  if (String(reason).length < 10 || String(reason).length > 500) return failCtx(c, '申请理由需10-500字');

  const amountMap = { '国家助学金（一等）': 5000, '国家助学金（二等）': 3000, '学校困难补助': 2000, '社会助学金': 10000 };
  const amount = amountMap[type] || 0;
  const applicationId = `SCO${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();
  try {
    await db.execute(sql`
      INSERT INTO t_data_scholarship_application
        (student_no, application_id, type, family_size, family_members, income, level, apply_date, phone, reason, status, amount, audit_logs, current_node)
      VALUES
        (${auth.studentNo ?? ''}, ${applicationId}, ${type}, ${familySize}, ${familyMembers}, ${String(income)}, ${level}, ${date}::date, ${phone}, ${reason}, 'pending', ${amount}, ${JSON.stringify([{operator: auth.name ?? '学生', operatorRole: 'student', action: '提交申请', opinion: reason, operatedAt: now}])}::jsonb, 'teacher_review')
    `);
  } catch (e) { console.error('scholarship apply DB write failed:', e); }
  return okCtx(c, { applicationId }, '申请已提交');
});

// API-033: GET /api/student/scholarship/records
scholarship.get('/api/student/scholarship/records', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  try {
    const rows = (await db.execute(sql`
      SELECT application_id AS "applicationId", type, status, amount, created_at AS "applyDate"
      FROM t_data_scholarship_application
      WHERE student_no = ${auth.studentNo ?? ''}
      ORDER BY created_at DESC
    `)) as any[];
    return okCtx(c, { records: rows });
  } catch { return okCtx(c, { records: [] }); }
});

export default scholarship;
