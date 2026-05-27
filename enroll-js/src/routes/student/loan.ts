import { Hono } from 'hono';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const loan = new Hono();

// API-034: POST /api/student/loan/apply — 贷款申请
loan.post('/api/student/loan/apply', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { bank, amount, code, date, reason } = await c.req.json().catch(() => ({}));
  if (!bank || !amount || !code || !date || !reason) return failCtx(c, '请填写完整的申请信息');
  if (!['国家开发银行', '中国农业银行', '其他'].includes(bank)) return failCtx(c, '银行类型不正确');
  if (amount <= 0) return failCtx(c, '贷款金额必须大于0');
  if (String(reason).length < 10 || String(reason).length > 500) return failCtx(c, '申请原因需10-500字');

  const applicationId = `LOAN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return okCtx(c, { applicationId }, '贷款申请已提交');
});

// API-035: GET /api/student/loan/records — 贷款记录
loan.get('/api/student/loan/records', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  return okCtx(c, { records: [] });
});

export default loan;
