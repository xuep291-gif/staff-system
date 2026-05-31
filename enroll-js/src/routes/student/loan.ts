import { Hono } from 'hono';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';

const loan = new Hono();

// API-034: POST /api/student/loan/apply
loan.post('/api/student/loan/apply', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { bank, amount, code, date, reason } = await c.req.json().catch(() => ({}));
  if (!bank || !amount || !code || !date || !reason) return failCtx(c, '请填写完整的申请信息');
  if (!['国家开发银行', '中国农业银行', '其他'].includes(bank)) return failCtx(c, '银行类型不正确');
  if (amount <= 0) return failCtx(c, '贷款金额必须大于0');
  if (String(reason).length < 10 || String(reason).length > 500) return failCtx(c, '申请原因需10-500字');

  const applicationId = `LOAN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();
  try {
    await db.execute(sql`
      INSERT INTO t_data_loan_application
        (student_no, application_id, bank, amount, code, apply_date, reason, status, loan_type, audit_logs, current_node)
      VALUES
        (${auth.studentNo ?? ''}, ${applicationId}, ${bank}, ${amount}, ${code}, ${date}::date, ${reason}, 'pending', 'campus', ${JSON.stringify([{operator: auth.name ?? '学生', operatorRole: 'student', action: '提交申请', opinion: reason, operatedAt: now}])}::jsonb, 'teacher_review')
    `);
  } catch (e) { console.error('loan apply DB write failed:', e); }
  return okCtx(c, { applicationId }, '贷款申请已提交');
});

// API-035: GET /api/student/loan/records
loan.get('/api/student/loan/records', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  try {
    const rows = (await db.execute(sql`
      SELECT application_id AS "applicationId", bank, amount, status, created_at AS "applyDate"
      FROM t_data_loan_application
      WHERE student_no = ${auth.studentNo ?? ''}
      ORDER BY created_at DESC
    `)) as any[];
    return okCtx(c, { records: rows });
  } catch { return okCtx(c, { records: [] }); }
});

export default loan;
