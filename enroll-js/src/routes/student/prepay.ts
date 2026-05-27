import { Hono } from 'hono';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const prepay = new Hono();

// API-041: GET /api/student/payment/prepay/records — 预缴费记录
prepay.get('/api/student/payment/prepay/records', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  return okCtx(c, { balance: 0, records: [] });
});

// API-042: POST /api/student/payment/prepay/order — 预缴费充值
prepay.post('/api/student/payment/prepay/order', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { amount, method } = await c.req.json().catch(() => ({}));
  if (!amount || amount <= 0) return failCtx(c, '充值金额必须大于0');
  if (!['wx', 'ali', 'union'].includes(method)) return failCtx(c, '支付方式不正确');

  const orderId = `PRE${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return okCtx(c, { orderId, payUrl: null });
});

export default prepay;
