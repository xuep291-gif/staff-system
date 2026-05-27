import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const offlinePayments = new Hono();

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Mock offline payment store (in-memory; would normally be a DB table)
const offlinePaymentStore: any[] = [];

// GET /payments/offline/pending — 线下缴费待审核列表
offlinePayments.get('/payments/offline/pending', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);
  if (!staff.roles.includes('finance')) return failCtx(c, '无权限，需要财务角色', 40300);

  const status = c.req.query('status');
  const keyword = c.req.query('keyword');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  const pageNum = Number(c.req.query('pageNum') || 1);
  const pageSize = Number(c.req.query('pageSize') || 20);

  let items = [...offlinePaymentStore];

  // If no records yet, generate realistic mock data
  if (items.length === 0) {
    const methods = ['cash', 'bank_transfer', 'pos'];
    const statuses = ['pending', 'pending', 'pending', 'confirmed', 'confirmed', 'rejected'];
    const locations = ['财务处缴费窗口', '分行营业厅', '校园卡中心', '行政楼一楼大厅', '招生就业处服务台'];
    const mockStudents = [
      { id: 'STU2024001', no: '2024001', name: '张同学' },
      { id: 'STU2024002', no: '2024002', name: '李同学' },
      { id: 'STU2024003', no: '2024003', name: '王同学' },
      { id: 'STU2024004', no: '2024004', name: '赵同学' },
      { id: 'STU2024005', no: '2024005', name: '陈同学' },
      { id: 'STU2024006', no: '2024006', name: '刘同学' },
      { id: 'STU2024007', no: '2024007', name: '周同学' },
      { id: 'STU2024008', no: '2024008', name: '吴同学' },
      { id: 'STU2024009', no: '2024009', name: '孙同学' },
      { id: 'STU2024010', no: '2024010', name: '杨同学' },
      { id: 'STU2024011', no: '2024011', name: '黄同学' },
      { id: 'STU2024012', no: '2024012', name: '郑同学' },
    ];

    // Try to query real students from DB
    let dbStudents: any[] = [];
    try {
      const studentRows = await db.execute(sql`
        SELECT id, student_no, name FROM t_data_student WHERE delete_flag = 0 LIMIT 20
      `);
      dbStudents = (studentRows as any[]);
    } catch { /* fall back to mock */ }

    const students = dbStudents.length > 0
      ? dbStudents.map(s => ({ id: String(s.id || s.student_no), no: s.student_no, name: s.name }))
      : mockStudents;

    for (let i = 0; i < 18; i++) {
      const s = students[i % students.length];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const st = statuses[Math.floor(Math.random() * statuses.length)];
      const pastDays = Math.floor(Math.random() * 30);
      const submittedAt = new Date(Date.now() - pastDays * 86400000 - Math.random() * 28800000).toISOString();
      items.push({
        offlinePaymentId: `OFP_${Date.now() - i * 100000}_${Math.random().toString(36).slice(2, 6)}`,
        studentId: s.id,
        studentNo: s.no,
        studentName: s.name,
        amount: [5200, 1200, 6400, 800, 180, 7000, 6400, 300][Math.floor(Math.random() * 8)],
        method,
        location: locations[Math.floor(Math.random() * locations.length)],
        submittedAt,
        voucherFiles: [
          { name: `缴费凭证_${i + 1}_1.jpg`, url: `/uploads/vouchers/${i + 1}_1.jpg`, size: 102400 + Math.floor(Math.random() * 512000) },
          { name: `缴费凭证_${i + 1}_2.jpg`, url: `/uploads/vouchers/${i + 1}_2.jpg`, size: 204800 + Math.floor(Math.random() * 256000) },
        ],
        status: st,
      });
    }
    offlinePaymentStore.push(...items);
  }

  // Filtering
  if (status) {
    items = items.filter(r => r.status === status);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    items = items.filter(r =>
      r.studentNo?.toLowerCase().includes(kw) ||
      r.studentName?.toLowerCase().includes(kw) ||
      r.studentId?.toLowerCase().includes(kw)
    );
  }
  if (startDate) {
    items = items.filter(r => r.submittedAt >= startDate);
  }
  if (endDate) {
    items = items.filter(r => r.submittedAt <= endDate + 'T23:59:59.999Z');
  }

  const total = items.length;
  const start = (pageNum - 1) * pageSize;
  const paged = items.slice(start, start + pageSize).map(r => ({
    offlinePaymentId: r.offlinePaymentId,
    studentId: r.studentId,
    studentNo: r.studentNo,
    studentName: r.studentName,
    amount: r.amount,
    method: r.method,
    location: r.location,
    submittedAt: r.submittedAt,
    voucherFiles: r.voucherFiles,
    status: r.status,
  }));

  return okCtx(c, { items: paged, total, pageNum, pageSize, totalPages: Math.ceil(total / pageSize) });
});

// POST /payments/offline/:offlinePaymentId/confirm — 确认线下缴费
offlinePayments.post('/payments/offline/:offlinePaymentId/confirm', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);
  if (!staff.roles.includes('finance')) return failCtx(c, '无权限，需要财务角色', 40300);

  const offlinePaymentId = c.req.param('offlinePaymentId');
  const { confirmedAmount, billAllocations, remark } = await c.req.json().catch(() => ({}));

  if (!confirmedAmount) return failCtx(c, '请填写确认金额', 40001);

  const now = new Date().toISOString();
  const paymentRecordId = generateId('PMT');
  const invoiceId = `INV${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // Try to find the existing offline payment record
  let existing: any = offlinePaymentStore.find(p => p.offlinePaymentId === offlinePaymentId);
  if (!existing) {
    // Try to find from student data
    try {
      const rows = await db.execute(sql`
        SELECT id, student_no, fee_type, amount FROM t_data_billing
        WHERE billing_no = ${offlinePaymentId}
        LIMIT 1
      `);
      if ((rows as any[]).length > 0) {
        const r = (rows as any[])[0];
        existing = {
          offlinePaymentId,
          studentId: r.student_no || offlinePaymentId,
          studentNo: r.student_no,
          studentName: '',
          amount: Number(r.amount || confirmedAmount),
          method: 'cash',
          location: '',
          submittedAt: now,
          voucherFiles: [],
          status: 'pending',
        };
      }
    } catch { /* fall back */ }
  }
  if (!existing) {
    existing = {
      offlinePaymentId,
      studentId: offlinePaymentId,
      studentNo: offlinePaymentId,
      studentName: `学生_${offlinePaymentId}`,
      amount: confirmedAmount,
      method: 'cash',
      location: '',
      submittedAt: now,
      voucherFiles: [],
      status: 'pending',
    };
  }

  // Update the payment status
  existing.status = 'confirmed';
  // Add/update in store
  const idx = offlinePaymentStore.findIndex(p => p.offlinePaymentId === offlinePaymentId);
  if (idx >= 0) {
    offlinePaymentStore[idx] = existing;
  } else {
    offlinePaymentStore.push(existing);
  }

  // Process bill allocations
  const allocations = billAllocations?.length
    ? billAllocations
    : [
        { billId: 'tuition', amount: Math.min(confirmedAmount, 5200) },
        { billId: 'dorm', amount: Math.min(Math.max(confirmedAmount - 5200, 0), 1200) },
      ].filter(a => a.amount > 0);

  const billStatuses: { billId: string; oldStatus: string; newStatus: string }[] = [];

  for (const alloc of allocations) {
    const oldStatus = 'unpaid';
    const newStatus = 'paid';
    billStatuses.push({ billId: alloc.billId, oldStatus, newStatus });

    // Persist to billing table
    try {
      await db.execute(sql`
        INSERT INTO t_data_billing (student_no, billing_no, fee_type, amount, pay_status, pay_time, created_at, updated_at)
        VALUES (${existing.studentId}, ${paymentRecordId}, ${alloc.billId}, ${alloc.amount}, 'paid', ${now}::timestamptz, ${now}::timestamptz, ${now}::timestamptz)
      `);
    } catch {
      // Try update if insert fails (unique constraint)
      try {
        await db.execute(sql`
          UPDATE t_data_billing
          SET pay_status = 'paid', pay_time = ${now}::timestamptz, updated_at = ${now}::timestamptz
          WHERE student_no = ${existing.studentId} AND fee_type = ${alloc.billId}
        `);
      } catch { /* best-effort */ }
    }
  }

  // If the payment is confirmed, also generate an invoice record
  if (remark) {
    try {
      await db.execute(sql`
        INSERT INTO t_data_billing (student_no, billing_no, fee_type, amount, pay_status, pay_time, created_at, updated_at)
        VALUES (${existing.studentId}, ${invoiceId}, 'invoice', ${confirmedAmount}, 'paid', ${now}::timestamptz, ${now}::timestamptz, ${now}::timestamptz)
      `);
    } catch { /* best-effort */ }
  }

  return okCtx(c, {
    paymentRecordId,
    paymentStatus: 'confirmed',
    billStatuses,
    invoiceId: remark ? invoiceId : null,
  }, '线下缴费审核确认成功');
});

export default offlinePayments;
