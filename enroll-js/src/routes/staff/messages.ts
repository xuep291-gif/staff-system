import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const messages = new Hono();

// ---------------------------------------------------------------------------
// In-memory stores (mock data since there are no dedicated message tables)
// ---------------------------------------------------------------------------
interface Message {
  messageId: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  bizType: string | null;
  bizId: string | null;
  url: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

interface Template {
  templateCode: string;
  templateName: string;
  channels: string[];
  variables: string[];
  content: string;
  status: string;
  createdAt: string;
}

interface SendRecord {
  recordId: string;
  templateCode: string;
  channel: string;
  receiverId: string;
  receiverName: string;
  status: string;
  sentAt: string;
  failureReason: string | null;
}

const messageStore: Message[] = [];
const templateStore: Template[] = [];
const sendRecordStore: SendRecord[] = [];

// Seed some realistic templates if store is empty
if (templateStore.length === 0) {
  const seeds: Template[] = [
    {
      templateCode: 'PAYMENT_DUE',
      templateName: '缴费提醒',
      channels: ['sms', 'push', 'in_app'],
      variables: ['studentName', 'amount', 'deadline', 'itemName'],
      content: '亲爱的${studentName}同学，您有${itemName}费用${amount}元尚未缴纳，请于${deadline}前完成缴费。',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      templateCode: 'DOCUMENT_REJECT',
      templateName: '材料驳回通知',
      channels: ['push', 'in_app'],
      variables: ['studentName', 'docType', 'reason'],
      content: '${studentName}同学，您提交的${docType}材料未通过审核，原因：${reason}，请重新提交。',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      templateCode: 'SCHOLARSHIP_APPROVED',
      templateName: '奖学金审批通过',
      channels: ['sms', 'push', 'in_app'],
      variables: ['studentName', 'scholarshipName', 'amount'],
      content: '恭喜${studentName}同学，您申请的${scholarshipName}已审批通过，金额${amount}元。',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      templateCode: 'LOAN_APPROVED',
      templateName: '助学贷款放款通知',
      channels: ['sms', 'push', 'in_app'],
      variables: ['studentName', 'amount', 'bankName'],
      content: '${studentName}同学，您的${bankName}助学贷款${amount}元已放款，请注意查收。',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      templateCode: 'CHECKIN_REMINDER',
      templateName: '报到提醒',
      channels: ['push', 'in_app'],
      variables: ['studentName', 'checkinDate', 'campus'],
      content: '${studentName}同学，请于${checkinDate}携带相关材料到${campus}校区办理报到手续。',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      templateCode: 'DORM_ASSIGNED',
      templateName: '宿舍分配通知',
      channels: ['push', 'in_app'],
      variables: ['studentName', 'building', 'roomNo', 'bedNo'],
      content: '${studentName}同学，您的宿舍已分配：${building}楼${roomNo}室${bedNo}号床位。',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      templateCode: 'SYSTEM_NOTICE',
      templateName: '系统通知',
      channels: ['in_app'],
      variables: ['title', 'content'],
      content: '${content}',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      templateCode: 'REFUND_NOTICE',
      templateName: '退费通知',
      channels: ['sms', 'push', 'in_app'],
      variables: ['studentName', 'amount', 'refundType', 'refundNo'],
      content: '${studentName}同学，您的${refundType}退费${amount}元已提交，退费单号：${refundNo}。',
      status: 'inactive',
      createdAt: new Date().toISOString(),
    },
  ];
  templateStore.push(...seeds);
}

// Seed some messages if store is empty
if (messageStore.length === 0) {
  const types = [
    'system_notice', 'payment_reminder', 'document_review',
    'scholarship_update', 'loan_update', 'checkin_notice', 'dorm_notice',
  ];
  const titles: Record<string, string> = {
    system_notice: '系统公告',
    payment_reminder: '缴费提醒',
    document_review: '材料审核通知',
    scholarship_update: '奖学金动态',
    loan_update: '助学贷款动态',
    checkin_notice: '报到须知',
    dorm_notice: '宿舍通知',
  };
  const contents: Record<string, string> = {
    system_notice: '系统将于本周六凌晨2:00-4:00进行维护升级，届时部分功能可能无法使用。',
    payment_reminder: '您的学费尚未缴清，请尽快完成缴费以免影响选课。',
    document_review: '您提交的录取通知书扫描件已通过审核。',
    scholarship_update: '国家奖学金申请已开始，符合条件的同学请于月底前提交申请。',
    loan_update: '您的生源地助学贷款已到账，请登录系统查看详情。',
    checkin_notice: '请携带身份证、录取通知书到各学院报到点办理报到。',
    dorm_notice: '宿舍调整申请已开放，需要调整宿舍的同学请在系统中提交申请。',
  };

  const now = Date.now();
  for (let i = 0; i < 42; i++) {
    const type = types[i % types.length];
    const createdAt = new Date(now - i * 86400000 * (i % 5 + 1) - Math.floor(Math.random() * 3600000)).toISOString();
    const read = i % 3 !== 0;
    messageStore.push({
      messageId: `MSG_${now - i * 1000}_MSG${String(i + 1).padStart(3, '0')}`,
      userId: `user_${(i % 5) + 1}`,
      type,
      title: titles[type] || '系统通知',
      content: contents[type] || '暂无详情',
      bizType: type,
      bizId: i % 2 === 0 ? `BIZ_${now}_${i}` : null,
      url: i % 3 === 0 ? `/pages/${type}/detail?id=${i}` : null,
      read,
      createdAt,
      readAt: read ? new Date(new Date(createdAt).getTime() + 1800000).toISOString() : null,
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function paginate<T>(arr: T[], pageNum: number, pageSize: number) {
  const pn = Math.max(1, pageNum);
  const ps = Math.min(100, Math.max(1, pageSize || 20));
  const total = arr.length;
  const totalPages = Math.ceil(total / ps);
  const items = arr.slice((pn - 1) * ps, pn * ps);
  return { items, pageNum: pn, pageSize: ps, total, totalPages };
}

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// 1. GET /messages — Message list
// ---------------------------------------------------------------------------
messages.get('/messages', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const role = c.req.query('role') || undefined;
  const status = c.req.query('status') || undefined;
  const type = c.req.query('type') || undefined;
  const pageNum = Number(c.req.query('pageNum')) || 1;
  const pageSize = Number(c.req.query('pageSize')) || 20;

  let filtered = [...messageStore];

  if (type) filtered = filtered.filter((m) => m.type === type);
  if (status === 'unread') filtered = filtered.filter((m) => !m.read);
  else if (status === 'read') filtered = filtered.filter((m) => m.read);

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const result = paginate(filtered, pageNum, pageSize);

  return okCtx(c, {
    items: result.items.map((m) => ({
      messageId: m.messageId,
      type: m.type,
      title: m.title,
      content: m.content,
      bizType: m.bizType,
      bizId: m.bizId,
      url: m.url,
      read: m.read,
      createdAt: m.createdAt,
      readAt: m.readAt,
    })),
    pageNum: result.pageNum,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  });
});

// ---------------------------------------------------------------------------
// 2. GET /messages/unread-count — Unread count
// ---------------------------------------------------------------------------
messages.get('/messages/unread-count', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const role = c.req.query('role') || undefined;

  const unread = messageStore.filter((m) => !m.read);

  const byType: Record<string, number> = {};
  for (const m of unread) {
    byType[m.type] = (byType[m.type] || 0) + 1;
  }

  // Ensure all known types appear even if zero
  const allTypes = ['system_notice', 'payment_reminder', 'document_review', 'scholarship_update', 'loan_update', 'checkin_notice', 'dorm_notice'];
  for (const t of allTypes) {
    if (!(t in byType)) byType[t] = 0;
  }

  return okCtx(c, { count: unread.length, byType });
});

// ---------------------------------------------------------------------------
// 3. PUT /messages/:messageId/read — Mark one as read
// ---------------------------------------------------------------------------
messages.put('/messages/:messageId/read', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const messageId = c.req.param('messageId');
  const msg = messageStore.find((m) => m.messageId === messageId);
  if (!msg) return failCtx(c, '消息不存在', 40401);

  msg.read = true;
  msg.readAt = new Date().toISOString();

  return okCtx(c, { messageId: msg.messageId, read: true, readAt: msg.readAt });
});

// ---------------------------------------------------------------------------
// 4. PUT /messages/read-all — Mark all as read
// ---------------------------------------------------------------------------
messages.put('/messages/read-all', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { role, type } = await c.req.json().catch(() => ({}));
  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const msg of messageStore) {
    if (msg.read) continue;
    if (type && msg.type !== type) continue;
    msg.read = true;
    msg.readAt = now;
    updatedCount++;
  }

  return okCtx(c, { updatedCount });
});

// ---------------------------------------------------------------------------
// 5. DELETE /messages/:messageId — Delete one message
// ---------------------------------------------------------------------------
messages.delete('/messages/:messageId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const messageId = c.req.param('messageId');
  const idx = messageStore.findIndex((m) => m.messageId === messageId);
  if (idx === -1) return failCtx(c, '消息不存在', 40401);

  messageStore.splice(idx, 1);
  return okCtx(c, { messageId, deleted: true });
});

// ---------------------------------------------------------------------------
// 6. DELETE /messages — Clear all messages (batch delete)
// ---------------------------------------------------------------------------
messages.delete('/messages', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { role, type } = await c.req.json().catch(() => ({}));

  let deletedCount = 0;
  for (let i = messageStore.length - 1; i >= 0; i--) {
    if (type && messageStore[i].type !== type) continue;
    messageStore.splice(i, 1);
    deletedCount++;
  }

  return okCtx(c, { deletedCount });
});

// ---------------------------------------------------------------------------
// 7. GET /messages/templates — Notification templates list
// ---------------------------------------------------------------------------
messages.get('/messages/templates', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  return okCtx(c, {
    items: templateStore.map((t) => ({
      templateCode: t.templateCode,
      templateName: t.templateName,
      channels: t.channels,
      variables: t.variables,
      content: t.content,
      status: t.status,
    })),
  });
});

// ---------------------------------------------------------------------------
// 8. POST /messages/templates — Create template
// ---------------------------------------------------------------------------
messages.post('/messages/templates', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { templateCode, templateName, channels, variables, content } = await c.req.json().catch(() => ({}));
  if (!templateCode || !templateName || !channels || !content) {
    return failCtx(c, 'templateCode、templateName、channels、content不能为空', 40001);
  }

  if (templateStore.some((t) => t.templateCode === templateCode)) {
    return failCtx(c, `模板 ${templateCode} 已存在`, 40001);
  }

  const now = new Date().toISOString();
  const tpl: Template = {
    templateCode,
    templateName,
    channels: channels || [],
    variables: variables || [],
    content,
    status: 'active',
    createdAt: now,
  };
  templateStore.push(tpl);

  return okCtx(c, { templateCode, status: 'active', createdAt: now });
});

// ---------------------------------------------------------------------------
// 9. POST /messages/send — Send notification
// ---------------------------------------------------------------------------
messages.post('/messages/send', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { templateCode, channels, receiverType, receiverIds, bizType, bizId, variables } =
    await c.req.json().catch(() => ({}));

  if (!templateCode) return failCtx(c, 'templateCode不能为空', 40001);
  if (!channels || channels.length === 0) return failCtx(c, 'channels不能为空', 40001);
  if (!receiverType) return failCtx(c, 'receiverType不能为空', 40001);
  if (!receiverIds || receiverIds.length === 0) return failCtx(c, 'receiverIds不能为空', 40001);

  const tpl = templateStore.find((t) => t.templateCode === templateCode);
  if (!tpl) return failCtx(c, `模板 ${templateCode} 不存在`, 40401);

  const taskId = genId('SEND');
  const total = receiverIds.length;
  const failed = Math.floor(Math.random() * Math.ceil(total * 0.05)); // ~5% random failure
  const accepted = total - failed;
  const now = new Date().toISOString();

  // Create send records
  for (let i = 0; i < receiverIds.length; i++) {
    const success = i < total - failed;
    const recId = genId('REC');
    sendRecordStore.push({
      recordId: recId,
      templateCode,
      channel: channels[i % channels.length],
      receiverId: receiverIds[i],
      receiverName: `用户_${receiverIds[i]}`,
      status: success ? 'success' : 'failed',
      sentAt: now,
      failureReason: success ? null : '网络超时，发送失败',
    });
  }

  return okCtx(c, { taskId, total, accepted, failed });
});

// ---------------------------------------------------------------------------
// 10. GET /messages/send-records — Send records
// ---------------------------------------------------------------------------
messages.get('/messages/send-records', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const templateCode = c.req.query('templateCode') || undefined;
  const channel = c.req.query('channel') || undefined;
  const status = c.req.query('status') || undefined;
  const startDate = c.req.query('startDate') || undefined;
  const endDate = c.req.query('endDate') || undefined;
  const pageNum = Number(c.req.query('pageNum')) || 1;
  const pageSize = Number(c.req.query('pageSize')) || 20;

  let filtered = [...sendRecordStore];

  if (templateCode) filtered = filtered.filter((r) => r.templateCode === templateCode);
  if (channel) filtered = filtered.filter((r) => r.channel === channel);
  if (status) filtered = filtered.filter((r) => r.status === status);
  if (startDate) filtered = filtered.filter((r) => new Date(r.sentAt) >= new Date(startDate));
  if (endDate) filtered = filtered.filter((r) => new Date(r.sentAt) <= new Date(endDate + 'T23:59:59'));

  filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  const result = paginate(filtered, pageNum, pageSize);

  return okCtx(c, {
    items: result.items.map((r) => ({
      recordId: r.recordId,
      templateCode: r.templateCode,
      channel: r.channel,
      receiverId: r.receiverId,
      receiverName: r.receiverName,
      status: r.status,
      sentAt: r.sentAt,
      failureReason: r.failureReason,
    })),
    pageNum: result.pageNum,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  });
});

export default messages;
