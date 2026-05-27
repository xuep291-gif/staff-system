import { Hono } from 'hono';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const scholarship = new Hono();

// API-031: GET /api/student/scholarship/types — 助学金类型列表
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

// API-032: POST /api/student/scholarship/apply — 申请助学金
scholarship.post('/api/student/scholarship/apply', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { type, familySize, familyMembers, income, level, date, phone, reason } = await c.req.json().catch(() => ({}));
  if (!type || !familySize || !familyMembers || !income || !level || !date || !phone || !reason) {
    return failCtx(c, '请填写完整的申请信息');
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) return failCtx(c, '手机号格式不正确');
  if (String(reason).length < 10 || String(reason).length > 500) return failCtx(c, '申请理由需10-500字');

  const applicationId = `SCO${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return okCtx(c, { applicationId }, '申请已提交');
});

// API-033: GET /api/student/scholarship/records — 助学金申请记录
scholarship.get('/api/student/scholarship/records', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  return okCtx(c, { records: [] });
});

export default scholarship;
