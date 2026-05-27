import { Hono } from 'hono';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const checkin = new Hono();

// API-039: GET /api/student/checkin/status — 签到状态
checkin.get('/api/student/checkin/status', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  return okCtx(c, {
    hasDorm: false,
    noDorm: false,
    checkedIn: false,
    checkinTime: null,
    dormInfo: null,
    location: '报到大厅',
    qrCode: null,
  });
});

// API-040: POST /api/student/checkin/confirm — 确认签到
checkin.post('/api/student/checkin/confirm', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const checkinTime = new Date().toISOString();
  return okCtx(c, { checkinTime }, '签到成功');
});

export default checkin;
