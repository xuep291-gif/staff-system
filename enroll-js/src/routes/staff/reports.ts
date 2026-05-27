import { Hono } from 'hono';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const reports = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
}

// ---------------------------------------------------------------------------
// 1. GET /reports/payment/progress — Payment progress report
// ---------------------------------------------------------------------------
reports.get('/reports/payment/progress', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const termId = c.req.query('termId') || '2024-1';
  const departmentId = c.req.query('departmentId') || undefined;
  const classId = c.req.query('classId') || undefined;
  const startDate = c.req.query('startDate') || undefined;
  const endDate = c.req.query('endDate') || undefined;
  const groupBy = c.req.query('groupBy') || 'department'; // department / class / grade / college / feeType

  // Generate mock data
  const colleges = ['计算机学院', '机械学院', '电气学院', '经管学院', '外语学院', '建筑学院'];
  const classes = ['软件工程2101', '计科2102', '机制2101', '电气2103', '会计2101', '英语2102', '建筑2101', '软件工程2102'];

  const groups: any[] = [];
  let grandTotal = 0;
  let grandPaid = 0;
  let grandUnpaid = 0;
  let grandPartial = 0;
  let grandReceivable = 0;
  let grandPaidAmount = 0;
  let grandUnpaidAmount = 0;

  const groupKeys = groupBy === 'class' ? classes : colleges;
  const groupNameField = groupBy === 'class' ? 'className' : 'collegeName';

  for (const key of groupKeys) {
    const totalStudents = randomInt(30, 120);
    const paidCount = randomInt(Math.floor(totalStudents * 0.6), Math.floor(totalStudents * 0.85));
    const unpaidCount = randomInt(0, Math.floor(totalStudents * 0.15));
    const partialCount = totalStudents - paidCount - unpaidCount;
    const receivableAmount = totalStudents * randomDecimal(5000, 8000);
    const paidAmount = receivableAmount * randomDecimal(0.55, 0.9);
    const unpaidAmount = parseFloat((receivableAmount - paidAmount).toFixed(2));
    const paymentRate = parseFloat(((paidAmount / receivableAmount) * 100).toFixed(2));

    groups.push({
      groupKey: key,
      [groupNameField]: key,
      totalStudents,
      paidCount,
      unpaidCount,
      partialCount,
      receivableAmount: parseFloat(receivableAmount.toFixed(2)),
      paidAmount: parseFloat(paidAmount.toFixed(2)),
      unpaidAmount: parseFloat(unpaidAmount.toFixed(2)),
      paymentRate,
    });

    grandTotal += totalStudents;
    grandPaid += paidCount;
    grandUnpaid += unpaidCount;
    grandPartial += partialCount;
    grandReceivable += receivableAmount;
    grandPaidAmount += paidAmount;
    grandUnpaidAmount += unpaidAmount;
  }

  const summary = {
    totalStudents: grandTotal,
    paidCount: grandPaid,
    unpaidCount: grandUnpaid,
    partialCount: grandPartial,
    receivableAmount: parseFloat(grandReceivable.toFixed(2)),
    paidAmount: parseFloat(grandPaidAmount.toFixed(2)),
    unpaidAmount: parseFloat(grandUnpaidAmount.toFixed(2)),
    paymentRate: parseFloat(((grandPaidAmount / grandReceivable) * 100).toFixed(2)),
  };

  return okCtx(c, { summary, groups });
});

// ---------------------------------------------------------------------------
// 2. GET /reports/payment/transactions — Payment transactions report
// ---------------------------------------------------------------------------
reports.get('/reports/payment/transactions', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const startDate = c.req.query('startDate') || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const endDate = c.req.query('endDate') || new Date().toISOString().slice(0, 10);
  const method = c.req.query('method') || undefined;
  const channel = c.req.query('channel') || undefined;
  const departmentId = c.req.query('departmentId') || undefined;
  const pageNum = Number(c.req.query('pageNum')) || 1;
  const pageSize = Number(c.req.query('pageSize')) || 20;

  const methods = ['wechat', 'alipay', 'bank_transfer', 'cash', 'pos'];
  const channels = ['online', 'offline', 'bank_counter', 'pos_terminal'];
  const items = ['学费', '住宿费', '教材费', '体检费', '保险费', '军训服装费', '网络使用费'];

  const total = 247;
  const items_count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
  const now = new Date();
  const records = [];

  for (let i = 0; i < items_count; i++) {
    const idx = (pageNum - 1) * pageSize + i + 1;
    const paidAt = new Date(now.getTime() - randomInt(0, 30) * 86400000 - randomInt(0, 86400000)).toISOString();
    records.push({
      paymentNo: `PAY${String(idx).padStart(8, '0')}`,
      studentNo: `STU${String(randomInt(1000, 9999)).padStart(4, '0')}`,
      studentName: `学生${idx}`,
      billNo: `BILL${String(randomInt(100, 999)).padStart(6, '0')}`,
      itemName: items[randomInt(0, items.length - 1)],
      amount: randomDecimal(100, 8000),
      method: method || methods[randomInt(0, methods.length - 1)],
      channel: channel || channels[randomInt(0, channels.length - 1)],
      paidAt,
      invoiceNo: idx % 3 === 0 ? `INV${String(idx).padStart(10, '0')}` : null,
    });
  }

  return okCtx(c, { items: records, pageNum, pageSize, total, totalPages: Math.ceil(total / pageSize) });
});

// ---------------------------------------------------------------------------
// 3. GET /reports/payment/methods — Payment methods statistics
// ---------------------------------------------------------------------------
reports.get('/reports/payment/methods', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const totalAmount = 1256800.00;
  const methodData = [
    { method: 'wechat', count: 3542, amount: 520300.00 },
    { method: 'alipay', count: 2890, amount: 431200.00 },
    { method: 'bank_transfer', count: 1200, amount: 198500.00 },
    { method: 'cash', count: 450, amount: 62500.00 },
    { method: 'pos', count: 380, amount: 44300.00 },
  ];

  const result = methodData.map((m) => ({
    method: m.method,
    count: m.count,
    amount: m.amount,
    percentage: parseFloat(((m.amount / totalAmount) * 100).toFixed(2)),
  }));

  return okCtx(c, result);
});

// ---------------------------------------------------------------------------
// 4. GET /reports/payment/trend — Payment trend
// ---------------------------------------------------------------------------
reports.get('/reports/payment/trend', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const startDate = c.req.query('startDate') || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const endDate = c.req.query('endDate') || new Date().toISOString().slice(0, 10);
  const granularity = c.req.query('granularity') || 'day'; // day / week / month

  const days = daysBetween(startDate, endDate);
  const points = [];
  let interval = 1;
  if (granularity === 'week') interval = 7;
  else if (granularity === 'month') interval = 30;

  const baseAmount = 15000;
  const baseCount = 15;
  const start = new Date(startDate);

  for (let d = 0; d < days; d += interval) {
    const date = new Date(start.getTime() + d * 86400000);
    // Add some variation
    const variation = randomDecimal(0.7, 1.3);
    points.push({
      date: date.toISOString().slice(0, 10),
      amount: parseFloat((baseAmount * variation).toFixed(2)),
      count: Math.round(baseCount * variation),
    });
  }

  // If fewer than 2 points, ensure at least start and end
  if (points.length < 2) {
    points.push({
      date: new Date(endDate).toISOString().slice(0, 10),
      amount: parseFloat((baseAmount * randomDecimal(0.9, 1.1)).toFixed(2)),
      count: Math.round(baseCount * randomDecimal(0.9, 1.1)),
    });
  }

  return okCtx(c, { points });
});

// ---------------------------------------------------------------------------
// 5. GET /reports/payment/arrears — Arrears statistics
// ---------------------------------------------------------------------------
reports.get('/reports/payment/arrears', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const colleges = ['计算机学院', '机械学院', '电气学院', '经管学院', '外语学院', '建筑学院', '化工学院', '理学院'];
  const classes = ['软件2101', '计科2102', '机制2101', '电气2103', '会计2101', '英语2102', '建筑2101', '化工2101', '数学2102'];
  const items = ['学费', '住宿费', '教材费', '体检费', '保险费'];

  const byCollege = colleges.map((name) => ({
    collegeName: name,
    unpaidCount: randomInt(5, 45),
    unpaidAmount: randomDecimal(15000, 180000),
    overdueCount: randomInt(0, 8),
  }));

  const byClass = classes.map((name) => ({
    className: name,
    unpaidCount: randomInt(2, 15),
    unpaidAmount: randomDecimal(5000, 80000),
    overdueCount: randomInt(0, 3),
  }));

  const byItem = items.map((name) => ({
    itemName: name,
    unpaidCount: randomInt(10, 80),
    unpaidAmount: randomDecimal(10000, 200000),
    overdueCount: randomInt(0, 12),
  }));

  return okCtx(c, { byCollege, byClass, byItem });
});

// ---------------------------------------------------------------------------
// 6. GET /reports/refunds — Refund statistics
// ---------------------------------------------------------------------------
reports.get('/reports/refunds', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const totalApplications = 156;
  const pendingCount = 23;
  const successCount = 118;
  const failedCount = 15;
  const totalAmount = 78200.00;

  const byStatus = [
    { status: 'pending', count: pendingCount, amount: 11500.00 },
    { status: 'processing', count: 12, amount: 6300.00 },
    { status: 'success', count: successCount, amount: 56200.00 },
    { status: 'failed', count: failedCount, amount: 4200.00 },
  ];

  const byFeeType = [
    { feeType: 'tuition', label: '学费', count: 42, amount: 31200.00 },
    { feeType: 'accommodation', label: '住宿费', count: 38, amount: 15200.00 },
    { feeType: 'books', label: '教材费', count: 25, amount: 7500.00 },
    { feeType: 'insurance', label: '保险费', count: 18, amount: 3600.00 },
    { feeType: 'uniform', label: '校服费', count: 15, amount: 4500.00 },
    { feeType: 'other', label: '其他', count: 18, amount: 16200.00 },
  ];

  const byCollege = [
    { collegeName: '计算机学院', count: 35, amount: 18200.00 },
    { collegeName: '机械学院', count: 28, amount: 14200.00 },
    { collegeName: '电气学院', count: 24, amount: 12500.00 },
    { collegeName: '经管学院', count: 22, amount: 11800.00 },
    { collegeName: '外语学院', count: 20, amount: 9800.00 },
    { collegeName: '建筑学院', count: 18, amount: 7500.00 },
    { collegeName: '化工学院', count: 9, amount: 4200.00 },
  ];

  return okCtx(c, {
    totalApplications,
    pendingCount,
    successCount,
    failedCount,
    totalAmount,
    byStatus,
    byFeeType,
    byCollege,
  });
});

// ---------------------------------------------------------------------------
// 7. GET /reports/diff-refunds — Diff refund statistics
// ---------------------------------------------------------------------------
reports.get('/reports/diff-refunds', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const totalApplications = 45;
  const pendingCount = 8;
  const confirmedCount = 37;
  const totalDiffAmount = 42600.00;

  const byDormChange = [
    {
      dormChangeType: 'upgrade',
      label: '调高宿舍标准',
      count: 12,
      diffAmount: 15600.00,
      description: '从普通宿舍调至标准宿舍，需补交差额',
    },
    {
      dormChangeType: 'downgrade',
      label: '调低宿舍标准',
      count: 18,
      diffAmount: -19800.00,
      description: '从标准宿舍调至普通宿舍，退还差额',
    },
    {
      dormChangeType: 'room_change',
      label: '同等级换宿',
      count: 10,
      diffAmount: 1200.00,
      description: '同等级宿舍间调整，少量差额',
    },
    {
      dormChangeType: 'withdraw',
      label: '退宿',
      count: 5,
      diffAmount: -6000.00,
      description: '退宿后按比例退还住宿费用',
    },
  ];

  return okCtx(c, {
    totalApplications,
    pendingCount,
    confirmedCount,
    totalDiffAmount,
    byDormChange,
  });
});

// ---------------------------------------------------------------------------
// 8. GET /reports/dashboard — Comprehensive dashboard
// ---------------------------------------------------------------------------
reports.get('/reports/dashboard', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const payment = {
    totalStudents: 1560,
    paidCount: 1342,
    unpaidCount: 180,
    partialCount: 38,
    receivableAmount: 12480000.00,
    paidAmount: 10736000.00,
    unpaidAmount: 1744000.00,
    paymentRate: 86.03,
    todayAmount: 45200.00,
    todayCount: 15,
    monthlyTrend: [
      { month: '01', amount: 3200000 },
      { month: '02', amount: 2800000 },
      { month: '03', amount: 1500000 },
      { month: '04', amount: 1800000 },
      { month: '05', amount: 1436000 },
    ],
  };

  const checkin = {
    totalStudents: 1560,
    checkedInCount: 1440,
    notCheckedInCount: 95,
    inProgressCount: 25,
    checkinRate: 92.31,
    todayCheckedIn: 8,
    byCollege: [
      { collegeName: '计算机学院', total: 220, checkedIn: 208, rate: 94.55 },
      { collegeName: '机械学院', total: 195, checkedIn: 182, rate: 93.33 },
      { collegeName: '电气学院', total: 185, checkedIn: 172, rate: 92.97 },
      { collegeName: '经管学院', total: 170, checkedIn: 158, rate: 92.94 },
      { collegeName: '外语学院', total: 145, checkedIn: 132, rate: 91.03 },
      { collegeName: '建筑学院', total: 130, checkedIn: 118, rate: 90.77 },
    ],
  };

  const documentReview = {
    totalStudents: 1560,
    verifiedCount: 1250,
    pendingCount: 180,
    rejectedCount: 85,
    notSubmittedCount: 45,
    rate: 80.13,
    byType: [
      { docType: 'admission_letter', label: '录取通知书', verified: 1480, pending: 45, rejected: 35 },
      { docType: 'id_card', label: '身份证', verified: 1520, pending: 22, rejected: 18 },
      { docType: 'photo', label: '证件照', verified: 1400, pending: 120, rejected: 40 },
      { docType: 'health_cert', label: '体检报告', verified: 1320, pending: 180, rejected: 60 },
      { docType: 'party_doc', label: '党团关系', verified: 900, pending: 580, rejected: 80 },
    ],
  };

  const dormitory = {
    totalBeds: 1600,
    assignedCount: 1400,
    unassignedCount: 200,
    pendingChangeCount: 35,
    pendingWithdrawCount: 12,
    occupancyRate: 87.5,
    byBuilding: [
      { buildingNo: '1号公寓', totalBeds: 400, assigned: 368, rate: 92.0 },
      { buildingNo: '2号公寓', totalBeds: 400, assigned: 355, rate: 88.75 },
      { buildingNo: '3号公寓', totalBeds: 400, assigned: 342, rate: 85.5 },
      { buildingNo: '4号公寓', totalBeds: 400, assigned: 335, rate: 83.75 },
    ],
  };

  const scholarship = {
    totalApplications: 245,
    approvedCount: 178,
    pendingCount: 42,
    rejectedCount: 25,
    paidCount: 165,
    totalAmount: 892000.00,
    byType: [
      { type: 'national', label: '国家奖学金', count: 12, amount: 96000.00, unitAmount: 8000 },
      { type: 'inspirational', label: '国家励志奖学金', count: 38, amount: 190000.00, unitAmount: 5000 },
      { type: 'school_first', label: '校级一等奖', count: 52, amount: 156000.00, unitAmount: 3000 },
      { type: 'school_second', label: '校级二等奖', count: 68, amount: 136000.00, unitAmount: 2000 },
      { type: 'school_third', label: '校级三等奖', count: 75, amount: 112500.00, unitAmount: 1500 },
    ],
  };

  const loan = {
    totalApplications: 86,
    approvedCount: 74,
    pendingCount: 8,
    rejectedCount: 4,
    paidCount: 72,
    repayingCount: 2,
    totalAmount: 688000.00,
    byBank: [
      { bankName: '国家开发银行', count: 52, amount: 416000.00 },
      { bankName: '中国银行', count: 18, amount: 162000.00 },
      { bankName: '农商银行', count: 16, amount: 110000.00 },
    ],
  };

  const refund = {
    totalApplications: 156,
    pendingCount: 23,
    processingCount: 12,
    successCount: 118,
    failedCount: 3,
    totalAmount: 78200.00,
  };

  const message = {
    totalSent: 15420,
    todaySent: 180,
    unreadCount: 234,
    topTypes: [
      { type: 'system_notice', count: 6120 },
      { type: 'payment_reminder', count: 3820 },
      { type: 'checkin_notice', count: 2150 },
      { type: 'document_review', count: 1880 },
    ],
  };

  return okCtx(c, {
    payment,
    checkin,
    documentReview,
    dormitory,
    scholarship,
    loan,
    refund,
    message,
  });
});

export default reports;
