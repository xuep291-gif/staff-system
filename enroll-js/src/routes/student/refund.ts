import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const refund = new Hono();

// API-029: POST /api/student/payment/refund — 退费申请
refund.post('/api/student/payment/refund', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { orderId, reason } = await c.req.json().catch(() => ({}));
  if (!orderId || !reason?.trim()) return failCtx(c, '订单号和退费原因不能为空');

  const refundId = `RF${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();

  // Record the refund request in billing table
  try {
    await db.execute(sql`
      INSERT INTO t_data_billing (student_no, billing_no, fee_type, amount, pay_status, pay_time, created_at, updated_at)
      VALUES (${auth.sid}, ${refundId}, 'refund', 0, 'unpaid', NULL, ${now}::timestamptz, ${now}::timestamptz)
    `);
  } catch { /* ignore */ }

  return okCtx(c, { refundId, status: '审核中' }, '退费申请已提交');
});

// API-030: GET /api/student/payment/refund-history — 退费记录
refund.get('/api/student/payment/refund-history', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  // Query billing for refund-type records
  const rows = await db.execute(sql`
    SELECT * FROM t_data_billing WHERE student_no = ${auth.sid} AND fee_type = 'refund' ORDER BY created_at DESC
  `);
  const records = (rows as any[]).map(r => ({
    id: r.billing_no || `RF_${r.id}`,
    title: '退费申请',
    date: r.created_at || '',
    desc: r.pay_status === 'paid' ? '已退费' : '审核中',
    amount: Number(r.amount) || 0,
    status: r.pay_status === 'paid' ? '已退费' : r.pay_status === 'unpaid' ? '审核中' : '已驳回',
  }));

  return okCtx(c, { records });
});

export default refund;
