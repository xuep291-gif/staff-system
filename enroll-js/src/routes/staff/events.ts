import { Hono } from 'hono';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const events = new Hono();

// ---------------------------------------------------------------------------
// In-memory store — pre-generate realistic state change events
// ---------------------------------------------------------------------------
interface StateChangeEvent {
  eventId: string;
  bizType: string;
  bizId: string;
  oldStatus: string;
  newStatus: string;
  operatorId: string;
  operatorRole: string;
  occurredAt: string;
  remark: string | null;
  requestId: string | null;
}

let eventStore: StateChangeEvent[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const bizTypeTransitions: Record<string, { from: string; to: string; remark: string }[]> = {
  payment: [
    { from: 'unpaid', to: 'paid', remark: '学生完成缴费' },
    { from: 'paid', to: 'refund_pending', remark: '学生申请退费' },
    { from: 'refund_pending', to: 'refunded', remark: '财务审核通过，已退费' },
    { from: 'partial', to: 'paid', remark: '补缴差额完成' },
    { from: 'unpaid', to: 'overdue', remark: '超过缴费期限，自动标记逾期' },
  ],
  document: [
    { from: 'pending', to: 'verified', remark: '材料审核通过' },
    { from: 'pending', to: 'rejected', remark: '材料不符合要求，已驳回' },
    { from: 'rejected', to: 'pending', remark: '学生重新提交材料' },
    { from: 'under_review', to: 'verified', remark: '复审通过' },
    { from: 'under_review', to: 'rejected', remark: '复审驳回' },
  ],
  scholarship: [
    { from: 'pending', to: 'under_review', remark: '学院初审通过' },
    { from: 'under_review', to: 'approved', remark: '学校评审通过' },
    { from: 'approved', to: 'paid', remark: '奖学金已发放' },
    { from: 'pending', to: 'rejected', remark: '不符合申请条件' },
  ],
  loan: [
    { from: 'pending', to: 'approved', remark: '贷款申请审批通过' },
    { from: 'approved', to: 'paid', remark: '银行已放款' },
    { from: 'paid', to: 'repaying', remark: '学生开始还款' },
    { from: 'pending', to: 'rejected', remark: '贷款申请被驳回' },
  ],
  refund: [
    { from: 'pending', to: 'processing', remark: '退费申请已受理' },
    { from: 'processing', to: 'refunded', remark: '退费已到账' },
    { from: 'pending', to: 'rejected', remark: '退费申请不符合条件' },
  ],
  checkin: [
    { from: 'not_checked_in', to: 'in_progress', remark: '学生到校开始报到流程' },
    { from: 'in_progress', to: 'checked_in', remark: '完成全部报到手续' },
  ],
  dormitory: [
    { from: 'pending', to: 'approved', remark: '宿舍申请审批通过' },
    { from: 'approved', to: 'processing', remark: '正在分配宿舍' },
    { from: 'processing', to: 'assigned', remark: '宿舍分配完成' },
    { from: 'pending', to: 'rejected', remark: '宿舍申请未通过' },
  ],
  uniform: [
    { from: 'not_received', to: 'ordered', remark: '已提交尺码，待厂家生产' },
    { from: 'ordered', to: 'partial', remark: '部分校服已到货' },
    { from: 'partial', to: 'received', remark: '全部校服已领取' },
  ],
};

// Seed events
const operators = [
  { id: 'staff_admin', role: 'admin', name: '系统管理员' },
  { id: 'staff_finance', role: 'finance', name: '财务老师' },
  { id: 'staff_teacher', role: 'teacher', name: '辅导员' },
  { id: 'staff_gov', role: 'government', name: '教育局管理员' },
];

let eventIdCounter = 0;
const now = Date.now();

for (const [bizType, transitions] of Object.entries(bizTypeTransitions)) {
  for (const t of transitions) {
    // Generate 2-4 events per transition, spaced out over the past few days
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const op = operators[Math.floor(Math.random() * operators.length)];
      const offset = Math.floor(Math.random() * 7 * 86400000); // within last 7 days
      eventIdCounter++;
      eventStore.push({
        eventId: `EVT_${now - offset}_${String(eventIdCounter).padStart(4, '0')}`,
        bizType,
        bizId: `BIZ_${bizType}_${2000 + Math.floor(Math.random() * 50)}`,
        oldStatus: t.from,
        newStatus: t.to,
        operatorId: op.id,
        operatorRole: op.role,
        occurredAt: new Date(now - offset).toISOString(),
        remark: t.remark,
        requestId: `REQ_${now - offset}_${Math.random().toString(36).slice(2, 8)}`,
      });
    }
  }
}

// Sort by occurredAt descending
eventStore.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

// ---------------------------------------------------------------------------
// 1. GET /events/business-state — Pull incremental state changes
// ---------------------------------------------------------------------------
events.get('/events/business-state', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const since = c.req.query('since') || undefined;
  const bizType = c.req.query('bizType') || undefined;
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 50));

  let filtered = [...eventStore];

  // Filter by since (eventId greater than the given one, or occurredAt after that event)
  if (since) {
    const sinceEvent = eventStore.find((e) => e.eventId === since);
    if (sinceEvent) {
      filtered = filtered.filter((e) => new Date(e.occurredAt) > new Date(sinceEvent.occurredAt));
    }
    // If since is an ISO date string, filter by that
    else if (/^\d{4}-\d{2}-\d{2}/.test(since)) {
      filtered = filtered.filter((e) => new Date(e.occurredAt) > new Date(since));
    }
  }

  if (bizType) {
    filtered = filtered.filter((e) => e.bizType === bizType);
  }

  // Limit results
  const items = filtered.slice(0, limit);

  return okCtx(c, {
    items: items.map((e) => ({
      eventId: e.eventId,
      bizType: e.bizType,
      bizId: e.bizId,
      oldStatus: e.oldStatus,
      newStatus: e.newStatus,
      operatorId: e.operatorId,
      operatorRole: e.operatorRole,
      occurredAt: e.occurredAt,
      remark: e.remark,
      requestId: e.requestId,
    })),
  });
});

export default events;
