import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { sign, verify, getToken, getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const auth = new Hono();
const codeStore = new Map<string, { code: string; expires: number }>();

// POST /auth/login/password
auth.post('/auth/login/password', async (c) => {
  const { account, password, clientType, appId } = await c.req.json().catch(() => ({}));
  if (!account || !password) return failCtx(c, '账号与密码不能为空', 40001);

  const users = await db.execute(sql`
    SELECT * FROM t_end_user
    WHERE (account = ${account} OR phone = ${account})
      AND delete_flag = 0
    LIMIT 1
  `);
  if ((users as any[]).length === 0) return failCtx(c, '账号不存在', 40100);

  const user: any = (users as any[])[0];
  if (user.password !== password) return failCtx(c, '密码错误', 40100);

  // Get staff role info from t_data_teacher or org system
  let roles: string[] = ['teacher'];
  let workNo = user.personal_no || account;
  let deptId = '';
  let orgId = '1';

  const teacherRows = await db.execute(sql`
    SELECT * FROM t_data_teacher WHERE teacher_no = ${workNo} LIMIT 1
  `);
  if ((teacherRows as any[]).length > 0) {
    const t = (teacherRows as any[])[0];
    if (t.role) roles = [t.role];
    // Check org tables for department
    const classRows = await db.execute(sql`
      SELECT college_id FROM t_data_org_college_class WHERE teacher_id = ${t.id} LIMIT 1
    `);
    if ((classRows as any[]).length > 0) {
      orgId = String((classRows as any[])[0].college_id);
    }
  }

  // Check for finance/government role
  const profileRows = await db.execute(sql`
    SELECT * FROM t_sys_user_role WHERE user_id = ${String(user.id)}
  `);
  for (const r of (profileRows as any[])) {
    if (r.role_code && !roles.includes(r.role_code)) roles.push(r.role_code);
  }

  const tokenPayload: Record<string, unknown> = {
    userId: String(user.id),
    name: user.name || account,
    workNo,
    role: roles[0],
    roles,
    orgId,
    departmentId: deptId,
    iat: Math.floor(Date.now() / 1000),
  };
  const accessToken = sign(tokenPayload);
  const refreshToken = sign({ ...tokenPayload, refresh: true });

  return okCtx(c, {
    accessToken,
    refreshToken,
    expiresIn: 7200,
    user: {
      userId: String(user.id),
      name: user.name || account,
      avatar: user.avatar || null,
      phone: user.phone || '',
      workNo,
      roles,
      typeList: roles,
      orgId,
      orgName: '',
      departmentId: deptId,
      departmentName: '',
    },
    defaultRole: roles[0],
    homePage: roles[0] === 'teacher' ? '/pages/teacher/home/index'
      : roles[0] === 'finance' ? '/pages/finance/home/index'
      : roles[0] === 'government' ? '/pages/government/home/index'
      : '/pages/teacher/home/index',
    permissions: [],
  });
});

// POST /auth/sms-code
auth.post('/auth/sms-code', async (c) => {
  const { phone, scene } = await c.req.json().catch(() => ({}));
  if (!phone || !scene) return failCtx(c, '手机号和场景不能为空', 40001);

  const code = String(Math.floor(1000 + Math.random() * 9000));
  const smsToken = `sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  codeStore.set(smsToken, { code, expires: Date.now() + 5 * 60 * 1000 });
  console.log(`[SMS] code for ${phone}/${scene}: ${code}`);
  return okCtx(c, { smsToken, expireSeconds: 300, cooldownSeconds: 60 });
});

// POST /auth/login/sms
auth.post('/auth/login/sms', async (c) => {
  const { phone, code, smsToken, clientType, appId } = await c.req.json().catch(() => ({}));
  if (!phone || !code) return failCtx(c, '手机号和验证码不能为空', 40001);

  const record = smsToken ? codeStore.get(smsToken) : null;
  if (!record || record.expires < Date.now()) {
    if (smsToken) codeStore.delete(smsToken);
    return failCtx(c, '验证码已过期', 40100);
  }
  if (record.code !== code) return failCtx(c, '验证码错误', 40100);
  if (smsToken) codeStore.delete(smsToken);

  const users = await db.execute(sql`
    SELECT * FROM t_end_user WHERE phone = ${phone} AND delete_flag = 0 LIMIT 1
  `);
  if ((users as any[]).length === 0) return failCtx(c, '用户不存在', 40100);

  const user: any = (users as any[])[0];
  const tokenPayload: Record<string, unknown> = {
    userId: String(user.id),
    name: user.name || phone,
    workNo: user.personal_no || '',
    role: 'teacher',
    roles: ['teacher'],
    orgId: '1',
    departmentId: '',
    iat: Math.floor(Date.now() / 1000),
  };
  const accessToken = sign(tokenPayload);
  const refreshToken = sign({ ...tokenPayload, refresh: true });

  return okCtx(c, {
    accessToken,
    refreshToken,
    expiresIn: 7200,
    user: { userId: String(user.id), name: user.name, avatar: user.avatar, phone, workNo: tokenPayload.workNo, roles: ['teacher'], typeList: ['teacher'], orgId: '1', orgName: '', departmentId: '', departmentName: '' },
    defaultRole: 'teacher',
    homePage: '/pages/teacher/home/index',
    permissions: [],
  });
});

// POST /auth/login/wechat-miniapp
auth.post('/auth/login/wechat-miniapp', async (c) => {
  const { code, appId, inviteCode, orgId, clientType } = await c.req.json().catch(() => ({}));
  if (!code) return failCtx(c, 'code不能为空', 40001);

  const users = await db.execute(sql`SELECT * FROM t_end_user WHERE openid = ${code} LIMIT 1`);
  if ((users as any[]).length === 0) {
    return okCtx(c, { accessToken: '', refreshToken: '', expiresIn: 0, user: null, openId: code, unionId: null, needBindPhone: true }, '请先绑定手机号');
  }

  const user: any = (users as any[])[0];
  const tokenPayload: Record<string, unknown> = {
    userId: String(user.id), name: user.name || '', workNo: user.personal_no || '', role: 'teacher', roles: ['teacher'], orgId: '1', departmentId: '', iat: Math.floor(Date.now() / 1000),
  };
  const accessToken = sign(tokenPayload);
  const refreshToken = sign({ ...tokenPayload, refresh: true });

  return okCtx(c, {
    accessToken, refreshToken, expiresIn: 7200,
    user: { userId: String(user.id), name: user.name, avatar: user.avatar, phone: user.phone, workNo: tokenPayload.workNo, roles: ['teacher'], typeList: ['teacher'], orgId: '1', orgName: '', departmentId: '', departmentName: '' },
    defaultRole: 'teacher', homePage: '/pages/teacher/home/index', permissions: [],
    openId: user.openid || code, unionId: user.unionid || null,
  });
});

// GET /auth/me
auth.get('/auth/me', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const users = await db.execute(sql`
    SELECT id, name, avatar, phone, personal_no FROM t_end_user WHERE id = ${Number(staff.userId)} AND delete_flag = 0 LIMIT 1
  `);
  const user = (users as any[])[0] || {};

  return okCtx(c, {
    userId: staff.userId, name: staff.name, avatar: user.avatar || null,
    phone: user.phone || '', maskedPhone: user.phone ? user.phone.slice(0, 3) + '****' + user.phone.slice(-4) : '',
    workNo: staff.workNo, roles: staff.roles, currentRole: staff.role,
    roleScopes: [], permissions: [], orgId: staff.orgId, departmentId: staff.departmentId,
  });
});

// POST /auth/switch-role
auth.post('/auth/switch-role', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const { role } = await c.req.json().catch(() => ({}));
  if (!role) return failCtx(c, '角色不能为空', 40001);
  if (!staff.roles.includes(role)) return failCtx(c, '无此角色权限', 40300);

  const tokenPayload: Record<string, unknown> = {
    userId: staff.userId, name: staff.name, workNo: staff.workNo, role, roles: staff.roles, orgId: staff.orgId, departmentId: staff.departmentId, iat: Math.floor(Date.now() / 1000),
  };
  const accessToken = sign(tokenPayload);
  return okCtx(c, {
    accessToken, currentRole: role,
    homePage: role === 'teacher' ? '/pages/teacher/home/index' : role === 'finance' ? '/pages/finance/home/index' : role === 'government' ? '/pages/government/home/index' : '/pages/teacher/home/index',
    permissions: [],
  });
});

// POST /auth/logout
auth.post('/auth/logout', async (c) => {
  return okCtx(c, true, '退出成功');
});

// POST /auth/refresh
auth.post('/auth/refresh', async (c) => {
  const { refreshToken } = await c.req.json().catch(() => ({}));
  if (!refreshToken) return failCtx(c, 'refreshToken不能为空', 40001);

  const payload = verify(refreshToken);
  if (!payload) return failCtx(c, 'refreshToken无效或已过期', 40100);

  const tokenPayload: Record<string, unknown> = {
    userId: payload.userId, name: payload.name, workNo: payload.workNo, role: payload.role, roles: payload.roles, orgId: payload.orgId, departmentId: payload.departmentId, iat: Math.floor(Date.now() / 1000),
  };
  const accessToken = sign(tokenPayload);
  const newRefreshToken = sign({ ...tokenPayload, refresh: true });
  return okCtx(c, { accessToken, refreshToken: newRefreshToken, expiresIn: 7200 });
});

// POST /account/phone/bind
auth.post('/account/phone/bind', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const { phone, code, smsToken } = await c.req.json().catch(() => ({}));
  if (!phone || !code) return failCtx(c, '手机号和验证码不能为空', 40001);

  const record = smsToken ? codeStore.get(smsToken) : null;
  if (!record || record.expires < Date.now() || record.code !== code) return failCtx(c, '验证码错误或已过期', 40001);

  await db.execute(sql`UPDATE t_end_user SET phone = ${phone} WHERE id = ${Number(staff.userId)}`);
  if (smsToken) codeStore.delete(smsToken);
  return okCtx(c, { phone }, '绑定成功');
});

// PUT /account/phone
auth.put('/account/phone', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const { oldCode, newPhone, newCode, oldSmsToken, newSmsToken } = await c.req.json().catch(() => ({}));
  if (!oldCode || !newPhone || !newCode) return failCtx(c, '参数不完整', 40001);

  const oldRecord = oldSmsToken ? codeStore.get(oldSmsToken) : null;
  const newRecord = newSmsToken ? codeStore.get(newSmsToken) : null;
  if ((oldRecord && (oldRecord.expires < Date.now() || oldRecord.code !== oldCode)) ||
      (newRecord && (newRecord.expires < Date.now() || newRecord.code !== newCode))) {
    return failCtx(c, '验证码错误或已过期', 40001);
  }

  await db.execute(sql`UPDATE t_end_user SET phone = ${newPhone} WHERE id = ${Number(staff.userId)}`);
  if (oldSmsToken) codeStore.delete(oldSmsToken);
  if (newSmsToken) codeStore.delete(newSmsToken);
  return okCtx(c, { phone: newPhone }, '修改成功');
});

// PUT /account/password
auth.put('/account/password', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const { oldPassword, newPassword } = await c.req.json().catch(() => ({}));
  if (!oldPassword || !newPassword) return failCtx(c, '原密码和新密码不能为空', 40001);
  if (newPassword.length < 6) return failCtx(c, '新密码至少6位', 40001);

  const users = await db.execute(sql`SELECT password FROM t_end_user WHERE id = ${Number(staff.userId)} LIMIT 1`);
  const user = (users as any[])[0];
  if (!user || user.password !== oldPassword) return failCtx(c, '原密码错误', 40001);

  await db.execute(sql`UPDATE t_end_user SET password = ${newPassword} WHERE id = ${Number(staff.userId)}`);
  return okCtx(c, true, '密码修改成功');
});

export default auth;
