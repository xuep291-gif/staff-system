import { Hono } from 'hono';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const feedback = new Hono();

// API-047: POST /api/student/feedback/submit — 提交评价
feedback.post('/api/student/feedback/submit', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { rating, comment, serviceType, serviceId } = await c.req.json().catch(() => ({}));
  if (!rating || rating < 1 || rating > 5) return failCtx(c, '请选择1-5星评分');

  return okCtx(c, null, '评价提交成功，感谢您的反馈');
});

export default feedback;
