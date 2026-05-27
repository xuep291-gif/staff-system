import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const address = new Hono();

// API-043: GET /api/student/address/list — 地址列表
address.get('/api/student/address/list', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const students = await db.execute(sql`
    SELECT address FROM t_data_student WHERE student_no = ${auth.sid} LIMIT 1
  `);
  const s = (students as any[])[0];
  const addresses = s?.address ? [{
    id: 1,
    name: auth.name,
    phone: '',
    region: '',
    detail: s.address,
    postalCode: '',
    isDefault: true,
  }] : [];

  return okCtx(c, { addresses });
});

// API-044: POST /api/student/address/save — 保存地址
address.post('/api/student/address/save', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { name, phone, region, detail, postalCode } = await c.req.json().catch(() => ({}));
  if (!name?.trim() || !phone?.trim() || !detail?.trim()) return failCtx(c, '收件人、电话和详细地址不能为空');
  if (!/^\d{11}$/.test(phone)) return failCtx(c, '手机号格式不正确');

  const addrStr = JSON.stringify({ name, phone, region, detail, postalCode });
  await db.execute(sql`UPDATE t_data_student SET address = ${addrStr}, updated_at = now() WHERE student_no = ${auth.sid}`);

  return okCtx(c, { addressId: 1 }, '保存成功');
});

export default address;
