import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { sign, getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const auth = new Hono();
const codeStore = new Map<string, { code: string; expires: number }>();

// Helper: get student info by sid (joins t_data_student + t_data_org_user_student for phone)
async function getStudentBySid(sid: string): Promise<any | null> {
  const students = await db.execute(sql`
    SELECT s.*, o.phone, o.college_id, o.major_id, o.class_id, o.idcard, o.is_resident
    FROM t_data_student s
    LEFT JOIN t_data_org_user_student o ON o.student_no = s.student_no
    WHERE s.student_no = ${sid} AND s.disabled = '0'
    LIMIT 1
  `);
  return (students as any[])[0] || null;
}

// API-006: POST /api/student/auth/send-code — 发送验证码
auth.post('/api/student/auth/send-code', async (c) => {
  const { phone, sid } = await c.req.json().catch(() => ({}));
  if (!phone || !sid) return failCtx(c, '手机号与学号不能为空');

  // Check student exists in t_data_org_user_student (has phone)
  const rows = await db.execute(sql`
    SELECT id, student_no FROM t_data_org_user_student
    WHERE student_no = ${sid} AND phone = ${phone} AND COALESCE(disabled, 0) = 0
    LIMIT 1
  `);
  if ((rows as any[]).length === 0) return failCtx(c, '学生信息不存在，请检查学号与手机号');

  const code = String(Math.floor(1000 + Math.random() * 9000));
  codeStore.set(`${sid}:${phone}`, { code, expires: Date.now() + 5 * 60 * 1000 });
  console.log(`[SMS] code for ${sid}/${phone}: ${code}`);
  return okCtx(c, null, '验证码已发送');
});

// API-001: POST /api/student/auth/login-code — 验证码登录
auth.post('/api/student/auth/login-code', async (c) => {
  const { sid, phone, code } = await c.req.json().catch(() => ({}));
  if (!sid || !phone || !code) return failCtx(c, '学号、手机号与验证码不能为空');

  const record = codeStore.get(`${sid}:${phone}`);
  if (!record || record.expires < Date.now()) {
    codeStore.delete(`${sid}:${phone}`);
    return failCtx(c, '验证码已过期，请重新获取');
  }
  if (record.code !== code) return failCtx(c, '验证码错误');
  codeStore.delete(`${sid}:${phone}`);

  const s = await getStudentBySid(sid);
  if (!s) return failCtx(c, '学生不存在');

  // Get college name from EAV
  let dept = '';
  if (s.college_id) {
    try {
      const cr = await db.execute(sql`
        SELECT v.field_value FROM t_eav_value v
        JOIN t_eav_attribute a ON a.id = v.attribute_id AND a.attribute_name = 'name'
        WHERE v.entity_id = 23 AND v.row_id IN (
          SELECT v2.row_id FROM t_eav_value v2
          JOIN t_eav_attribute a2 ON a2.id = v2.attribute_id AND a2.attribute_name = 'id'
          WHERE v2.entity_id = 23 AND v2.field_value = ${String(s.college_id)}
        ) LIMIT 1
      `);
      dept = ((cr as any[])[0]?.field_value) || '';
    } catch { /* ignore */ }
  }

  const token = sign({
    sid: s.student_no,
    name: s.name,
    phone: phone,
    iat: Math.floor(Date.now() / 1000),
  });

  return okCtx(c, {
    token,
    student: {
      sid: s.student_no,
      name: s.name,
      phone: phone,
      gender: s.gender === '1' ? '男' : s.gender === '0' ? '女' : s.gender,
      dept,
      grade: s.grade,
      major: s.major,
      avatar: null,
      dormType: null,
      isDorm: true,
    },
  }, '登录成功');
});

// API-002: POST /api/student/auth/login-pwd — 密码登录
auth.post('/api/student/auth/login-pwd', async (c) => {
  const { account, password } = await c.req.json().catch(() => ({}));
  if (!account || !password) return failCtx(c, '账号与密码不能为空');

  // Look up in t_end_user by account, phone, or personal_no
  const users = await db.execute(sql`
    SELECT id, account, password, salt, name, phone, avatar, personal_no
    FROM t_end_user
    WHERE (account = ${account} OR phone = ${account} OR personal_no = ${account})
      AND delete_flag = 0
    LIMIT 1
  `);
  if ((users as any[]).length === 0) return failCtx(c, '账号不存在');

  const user: any = (users as any[])[0];

  // Verify password
  if (user.password !== password) {
    if (user.salt && user.password) {
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(password + user.salt).digest('hex');
      if (hash !== user.password) return failCtx(c, '密码错误');
    } else {
      return failCtx(c, '密码错误');
    }
  }

  // Find linked student by user_id or personal_no
  let s = await getStudentBySid(user.personal_no || account);
  if (!s) {
    // Try by user_id
    const s2 = await db.execute(sql`
      SELECT * FROM t_data_student WHERE user_id = ${String(user.id)} AND disabled = '0' LIMIT 1
    `);
    s = (s2 as any[])[0] || null;
  }
  if (!s) return failCtx(c, '未找到关联学生信息');

  const token = sign({
    sid: s.student_no || s.sid || account,
    name: s.name || user.name,
    phone: s.phone || user.phone,
    iat: Math.floor(Date.now() / 1000),
  });

  return okCtx(c, {
    token,
    student: {
      sid: s.student_no || account,
      name: s.name || user.name,
      phone: s.phone || user.phone,
      gender: s.gender === '1' ? '男' : s.gender === '0' ? '女' : s.gender,
      dept: null,
      grade: s.grade,
      major: s.major,
      avatar: user.avatar || null,
      dormType: null,
      isDorm: true,
    },
  }, '登录成功');
});

// API-003: POST /api/student/auth/logout — 退出登录
auth.post('/api/student/auth/logout', async (c) => {
  return okCtx(c, null, '退出成功');
});

// API-004: GET /api/student/profile — 获取个人信息
auth.get('/api/student/profile', async (c) => {
  const user = getAuthStudent(c);
  if (!user) return failCtx(c, '未登录', 2, 401);

  const s = await getStudentBySid(user.sid);
  if (!s) return failCtx(c, '学生不存在', 3, 404);

  let dept = '';
  if (s.college_id) {
    try {
      const cr = await db.execute(sql`
        SELECT v.field_value FROM t_eav_value v
        JOIN t_eav_attribute a ON a.id = v.attribute_id AND a.attribute_name = 'name'
        WHERE v.entity_id = 23 AND v.row_id IN (
          SELECT v2.row_id FROM t_eav_value v2
          JOIN t_eav_attribute a2 ON a2.id = v2.attribute_id AND a2.attribute_name = 'id'
          WHERE v2.entity_id = 23 AND v2.field_value = ${String(s.college_id)}
        ) LIMIT 1
      `);
      dept = ((cr as any[])[0]?.field_value) || '';
    } catch { /* ignore */ }
  }

  // Check if user has identity bound in t_end_user
  const users = await db.execute(sql`
    SELECT id FROM t_end_user WHERE personal_no = ${user.sid} AND delete_flag = 0 LIMIT 1
  `);
  const identityBound = (users as any[]).length > 0;

  return okCtx(c, {
    student: {
      sid: s.student_no,
      name: s.name,
      phone: s.phone,
      gender: s.gender === '1' ? '男' : s.gender === '0' ? '女' : s.gender,
      dept,
      grade: s.grade,
      major: s.major,
      avatar: null,
      dormType: null,
      isDorm: true,
      identityBound,
      orgId: s.college_id || null,
      communityId: s.class_id || null,
    },
  });
});

// API-005: PUT /api/student/profile — 更新个人信息
auth.put('/api/student/profile', async (c) => {
  const user = getAuthStudent(c);
  if (!user) return failCtx(c, '未登录', 2, 401);

  const body = await c.req.json().catch(() => ({}));
  const { name, phone, avatar, address } = body;

  if (name) {
    await db.execute(sql`UPDATE t_data_student SET name = ${name}, updated_at = now() WHERE student_no = ${user.sid}`);
    await db.execute(sql`UPDATE t_data_org_user_student SET name = ${name}, updated_at = now() WHERE student_no = ${user.sid}`);
  }
  if (phone) {
    await db.execute(sql`UPDATE t_data_org_user_student SET phone = ${phone}, updated_at = now() WHERE student_no = ${user.sid}`);
  }
  if (address) {
    const addrStr = typeof address === 'string' ? address : JSON.stringify(address);
    await db.execute(sql`UPDATE t_data_student SET address = ${addrStr}, updated_at = now() WHERE student_no = ${user.sid}`);
  }

  const s = await getStudentBySid(user.sid);
  return okCtx(c, { student: { sid: s?.student_no || user.sid, name: s?.name, phone: s?.phone } }, '更新成功');
});

export default auth;
