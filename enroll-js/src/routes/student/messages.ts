import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';
import { getEavRows } from '../../lib/eav.js';

const messages = new Hono();

// API-036: GET /api/student/messages — 消息列表
messages.get('/api/student/messages', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const page = Number(c.req.query('page') || 1);
  const pageSize = Number(c.req.query('pageSize') || 20);

  // Try to get messages from billing reminders as notifications
  const bills = await db.execute(sql`
    SELECT id, fee_type, amount, pay_status, created_at FROM t_data_billing WHERE student_no = ${auth.sid} ORDER BY created_at DESC LIMIT 20
  `);

  const messages = (bills as any[]).map(b => ({
    id: b.id,
    title: b.pay_status === 'paid' ? '缴费成功通知' : '待缴费提醒',
    desc: `${b.fee_type || '费用'}: ¥${Number(b.amount || 0).toFixed(2)}`,
    time: b.created_at || '',
    icon: b.pay_status === 'paid' ? 'success' : 'bell',
    colorClass: b.pay_status === 'paid' ? 'green' : 'orange',
    category: '缴费',
    read: true,
    url: null,
  }));

  return okCtx(c, { messages, unreadCount: 0 });
});

// API-037: POST /api/student/messages/read — 标记已读
messages.post('/api/student/messages/read', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { messageId } = await c.req.json().catch(() => ({}));
  if (!messageId) return failCtx(c, '缺少消息ID');

  return okCtx(c, null, '已标记为已读');
});

// API-038: POST /api/student/messages/read-all — 全部已读
messages.post('/api/student/messages/read-all', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  return okCtx(c, null, '已全部标记为已读');
});

export default messages;
