import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';
import { getEavRows } from '../../lib/eav.js';

const bill = new Hono();

const defaultBills = [
  { id: 'tuition', name: '学费', category: 'mandatory', amount: 5200, paid: false, deadline: null, priority: 1, icon: null },
  { id: 'dorm', name: '住宿费', category: 'mandatory', amount: 1200, paid: false, deadline: null, priority: 2, icon: null },
  { id: 'book', name: '教材费', category: 'mandatory', amount: 800, paid: false, deadline: null, priority: 3, icon: null },
  { id: 'medical', name: '体检费', category: 'optional', amount: 180, paid: false, deadline: null, priority: 4, icon: null },
  { id: 'army', name: '军训服装费', category: 'optional', amount: 300, paid: false, deadline: null, priority: 5, icon: null },
];

// API-020: GET /api/student/bill/list — 账单列表
bill.get('/api/student/bill/list', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const billRows = await db.execute(sql`
    SELECT * FROM t_data_billing WHERE student_no = ${auth.sid}
  `);

  const dbBills = (billRows as any[]).map(b => ({
    id: b.fee_type || `bill_${b.id}`,
    name: b.fee_type === 'tuition' ? '学费' : b.fee_type === 'dorm' ? '住宿费' : b.fee_type === 'book' ? '教材费' : b.fee_type || '其他',
    category: 'mandatory' as const,
    amount: Number(b.amount) || 0,
    paid: b.pay_status === 'paid',
    deadline: null as string | null,
    priority: 0,
    icon: null as string | null,
  }));

  const bills = dbBills.length > 0 ? dbBills : [...defaultBills];
  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidAmount = bills.filter(b => b.paid).reduce((sum, b) => sum + b.amount, 0);

  return okCtx(c, {
    summary: { totalAmount, paidAmount, oweAmount: totalAmount - paidAmount, deadline: null },
    bills,
  });
});

// API-021: GET /api/student/bill/detail — 账单详情
bill.get('/api/student/bill/detail', async (c) => {
  const billId = c.req.query('billId');
  if (!billId) return failCtx(c, '缺少账单项ID');

  const bill = defaultBills.find(b => b.id === billId) || defaultBills[0];
  return okCtx(c, {
    bill: { ...bill, categoryName: bill.category === 'mandatory' ? '必缴' : '可选' },
    allocations: [],
  });
});

// API-022: POST /api/student/payment/order — 创建支付订单
bill.post('/api/student/payment/order', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { billIds, method, amount, armySelection } = await c.req.json().catch(() => ({}));
  if (!billIds?.length || !method || !amount) return failCtx(c, '参数不完整');

  const orderId = `ORD${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();

  // Create billing records for each billId
  for (const bid of billIds) {
    const feeType = bid;
    const billAmount = Math.floor(amount / billIds.length);
    try {
      await db.execute(sql`
        INSERT INTO t_data_billing (student_no, billing_no, fee_type, amount, pay_status, pay_time, created_at, updated_at)
        VALUES (${auth.sid}, ${orderId}, ${feeType}, ${billAmount}, 'paid', ${now}::timestamptz, ${now}::timestamptz, ${now}::timestamptz)
      `);
    } catch { /* continue - may already exist */ }
  }

  return okCtx(c, { orderId, amount, qrCode: null, payUrl: null });
});

// API-023: GET /api/student/payment/result — 支付结果查询
bill.get('/api/student/payment/result', async (c) => {
  const orderId = c.req.query('orderId');
  if (!orderId) return failCtx(c, '缺少订单号');

  // Check if we have billing records for this order
  const rows = await db.execute(sql`
    SELECT * FROM t_data_billing WHERE billing_no = ${orderId}
  `);
  const records = rows as any[];
  const status = records.length > 0 && records.every((r: any) => r.pay_status === 'paid') ? 'success' : 'pending';

  return okCtx(c, {
    status,
    info: {
      orderId,
      amount: records.reduce((s: number, r: any) => s + Number(r.amount || 0), 0),
      method: 'wx',
      payTime: records[0]?.pay_time || new Date().toISOString(),
      items: records.map((r: any) => ({ name: r.fee_type, amount: Number(r.amount || 0) })),
    },
  });
});

// API-024: GET /api/student/payment/history — 缴费记录
bill.get('/api/student/payment/history', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const page = Number(c.req.query('page') || 1);
  const pageSize = Number(c.req.query('pageSize') || 20);
  const status = c.req.query('status');

  let query = sql`SELECT * FROM t_data_billing WHERE student_no = ${auth.sid}`;
  if (status === 'paid') query = sql`SELECT * FROM t_data_billing WHERE student_no = ${auth.sid} AND pay_status = 'paid'`;

  const allRows = await db.execute(query);
  const rows = allRows as any[];

  const records = rows.map(r => ({
    orderId: r.billing_no || `ORD_${r.id}`,
    items: [r.fee_type || '费用'],
    amount: Number(r.amount) || 0,
    method: 'wx',
    status: r.pay_status === 'paid' ? 'paid' : 'pending',
    payTime: r.pay_time || r.created_at || '',
    isRefund: false,
    itemsDetail: [{ name: r.fee_type || '费用', price: Number(r.amount) || 0 }],
  }));

  return okCtx(c, { records, total: records.length });
});

// API-025: GET /api/student/payment/receipts — 电子票据列表
bill.get('/api/student/payment/receipts', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  // Generate receipts from paid billing records
  const rows = await db.execute(sql`
    SELECT id, billing_no, fee_type, amount, pay_time FROM t_data_billing
    WHERE student_no = ${auth.sid} AND pay_status = 'paid'
  `);
  const receipts = (rows as any[]).map((r, i) => ({
    no: `RCP${String(r.id).padStart(6, '0')}`,
    title: `${r.fee_type || '费用'} 电子票据`,
    date: r.pay_time || r.created_at || '',
    payer: '本人',
    amount: String(r.amount || 0),
    status: '已开具',
  }));

  return okCtx(c, { receipts });
});

// API-026: GET /api/student/payment/receipt/download — 下载票据
bill.get('/api/student/payment/receipt/download', async (c) => {
  const receiptId = c.req.query('receiptId');
  if (!receiptId) return failCtx(c, '缺少票据编号');

  return okCtx(c, { url: null, fileName: `receipt_${receiptId}.pdf` });
});

// API-027: GET /api/student/payment/prepay — 预缴费余额
bill.get('/api/student/payment/prepay', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  // Sum billing records that are prepay type
  const rows = await db.execute(sql`
    SELECT amount, fee_type, pay_time FROM t_data_billing WHERE student_no = ${auth.sid}
  `);
  const records = (rows as any[]).map(r => ({
    title: r.fee_type || '消费',
    date: r.pay_time || '',
    desc: '',
    amount: Number(r.amount) || 0,
    type: 'out' as const,
  }));
  const balance = records.reduce((s, r) => s + r.amount, 0) * -1;

  return okCtx(c, { balance: Math.max(0, balance), records });
});

// API-028: GET /api/student/bill/reminders — 催缴通知
bill.get('/api/student/bill/reminders', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  try {
    const reminders = await getEavRows('reminder_record');
    return okCtx(c, {
      reminders: reminders.map(r => ({
        id: Number(r.id),
        title: r.title || '催缴通知',
        billId: r.bill_type || '',
        date: r.created_at || '',
        deadline: r.deadline || '',
        overdueDays: Number(r.overdue_days || 0),
        amount: Number(r.amount || 0),
        urgency: r.urgency || 'normal',
      })),
    });
  } catch {
    return okCtx(c, { reminders: [] });
  }
});

export default bill;
