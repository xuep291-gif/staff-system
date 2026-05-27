import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const reminders = new Hono();

// Mock reminder task store (in-memory for demo; would normally be a DB table)
const reminderTasks: any[] = [];
const reminderRecords: any[] = [];

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// POST /reminders/send — 发送单条催缴提醒
reminders.post('/reminders/send', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);
  if (!staff.roles.includes('teacher')) return failCtx(c, '无权限，需要教师角色', 40300);

  const { studentId, billIds, channels, templateCode, remark } = await c.req.json().catch(() => ({}));
  if (!studentId) return failCtx(c, '请选择学生', 40001);

  const chs: string[] = channels?.length ? channels : ['sms'];
  const now = new Date().toISOString();
  const reminderId = generateId('REM');

  // Try to look up the student from t_data_student
  let studentInfo: any = { name: '', student_no: studentId };
  try {
    const studentRows = await db.execute(sql`
      SELECT student_no, name FROM t_data_student
      WHERE student_no = ${studentId} OR id::text = ${studentId}
      LIMIT 1
    `);
    if ((studentRows as any[]).length > 0) {
      studentInfo = (studentRows as any[])[0];
    }
  } catch { /* fall back to mock */ }

  // Try to count existing reminders for this student to determine urge count
  let urgeCount = 1;
  try {
    const countRows = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM t_data_billing
      WHERE student_no = ${studentId} AND fee_type = 'reminder'
    `);
    urgeCount = Number((countRows as any[])[0]?.cnt || 0) + 1;
  } catch { urgeCount = 1; }

  // Determine target bills
  let targetBills: { billId: string; amount: number }[] = [];
  if (billIds?.length) {
    targetBills = billIds.map((b: string) => ({ billId: b, amount: 0 }));
  } else {
    // Try to get unpaid bills from DB
    try {
      const billRows = await db.execute(sql`
        SELECT id, fee_type, amount FROM t_data_billing
        WHERE student_no = ${studentId} AND pay_status != 'paid'
      `);
      if ((billRows as any[]).length > 0) {
        targetBills = (billRows as any[]).map(r => ({
          billId: r.fee_type || `bill_${r.id}`,
          amount: Number(r.amount || 0),
        }));
      }
    } catch { /* fall back */ }
    if (targetBills.length === 0) {
      targetBills = [
        { billId: 'tuition', amount: 5200 },
        { billId: 'dorm', amount: 1200 },
      ];
    }
  }

  // Generate send results per channel
  const sendResults = chs.map((ch: string) => {
    const success = Math.random() > 0.05;
    return {
      channel: ch,
      success,
      message: success ? '发送成功' : '发送失败，通道繁忙',
    };
  });

  // Store a reminder record
  const record = {
    reminderId,
    studentId,
    studentNo: studentInfo.student_no || studentId,
    studentName: studentInfo.name || `学生_${studentId}`,
    billId: targetBills[0]?.billId || '',
    amount: targetBills[0]?.amount || 0,
    channel: chs.join(','),
    templateCode: templateCode || 'default_urge',
    sendStatus: sendResults.some(r => r.success) ? 'success' : 'failed',
    failureReason: sendResults.some(r => r.success) ? null : '所有渠道发送失败',
    sentAt: now,
    operatorName: staff.name,
  };
  reminderRecords.push(record);

  // Insert a billing record for tracking
  try {
    await db.execute(sql`
      INSERT INTO t_data_billing (student_no, billing_no, fee_type, amount, pay_status, created_at, updated_at)
      VALUES (${studentId}, ${reminderId}, 'reminder', 0, 'unpaid', ${now}::timestamptz, ${now}::timestamptz)
    `);
  } catch { /* best-effort */ }

  return okCtx(c, {
    reminderId,
    sentAt: now,
    sendResults,
    urgeCount,
  });
});

// POST /reminders/batch — 批量发送催缴提醒
reminders.post('/reminders/batch', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);
  if (!staff.roles.includes('teacher')) return failCtx(c, '无权限，需要教师角色', 40300);

  const { studentIds, scope, filter, channels, templateCode, remark } = await c.req.json().catch(() => ({}));

  let targetIds: string[] = studentIds || [];

  // If scope is all_unpaid or current_filter, try to resolve from DB
  if (scope === 'all_unpaid' || scope === 'current_filter') {
    try {
      const billRows = await db.execute(sql`
        SELECT DISTINCT student_no FROM t_data_billing WHERE pay_status != 'paid'
      `);
      if ((billRows as any[]).length > 0) {
        targetIds = (billRows as any[]).map((r: any) => r.student_no).filter(Boolean);
      }
    } catch { /* fall back */ }
  }

  if (!targetIds || targetIds.length === 0) {
    // Fallback mock students
    targetIds = ['STU2024001', 'STU2024002', 'STU2024003', 'STU2024004', 'STU2024005',
                 'STU2024006', 'STU2024007', 'STU2024008', 'STU2024009', 'STU2024010'];
  }

  const taskId = generateId('TSK');
  const now = new Date().toISOString();
  const chs: string[] = channels?.length ? channels : ['sms'];
  const accepted: string[] = [];
  const skippedReasons: { studentId: string; reason: string }[] = [];

  for (const sid of targetIds) {
    // Check if student already has a reminder today
    const alreadyReminded = reminderRecords.some(
      r => r.studentId === sid && r.sentAt && r.sentAt.slice(0, 10) === now.slice(0, 10)
    );
    if (alreadyReminded) {
      skippedReasons.push({ studentId: sid, reason: '今日已发送过提醒' });
      continue;
    }
    if (Math.random() > 0.9) {
      skippedReasons.push({ studentId: sid, reason: '该学生已缴清所有费用' });
      continue;
    }
    accepted.push(sid);

    // Create a record for each accepted student
    const record = {
      reminderId: generateId('REM'),
      taskId,
      studentId: sid,
      studentNo: sid,
      studentName: `学生_${sid}`,
      billId: 'tuition',
      amount: 5200,
      channel: chs.join(','),
      templateCode: templateCode || 'default_urge',
      sendStatus: 'success',
      failureReason: null,
      sentAt: now,
      operatorName: staff.name,
    };
    reminderRecords.push(record);
  }

  // Store the task
  const task = {
    taskId,
    taskName: remark || `批量催缴_${new Date().toLocaleDateString('zh-CN')}`,
    channels: chs,
    targetCount: targetIds.length,
    sentCount: accepted.length,
    failedCount: skippedReasons.length,
    status: accepted.length > 0 ? 'processing' : 'completed',
    createdBy: staff.name,
    createdAt: now,
    finishedAt: accepted.length > 0 ? null : now,
  };
  reminderTasks.push(task);

  return okCtx(c, {
    taskId,
    total: targetIds.length,
    accepted: accepted.length,
    skipped: skippedReasons.length,
    skippedReasons,
  });
});

// GET /reminders/tasks — 催缴任务列表
reminders.get('/reminders/tasks', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const status = c.req.query('status');
  const creatorId = c.req.query('creatorId');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  const pageNum = Number(c.req.query('pageNum') || 1);
  const pageSize = Number(c.req.query('pageSize') || 20);

  let tasks = [...reminderTasks];

  // If no tasks exist yet, generate mock tasks
  if (tasks.length === 0) {
    for (let i = 0; i < 15; i++) {
      const pastDate = new Date(Date.now() - i * 86400000 * 2).toISOString();
      tasks.push({
        taskId: `TSK_${Date.now() - i * 100000}_${Math.random().toString(36).slice(2, 6)}`,
        taskName: `批量催缴_${new Date(pastDate).toLocaleDateString('zh-CN')}`,
        channels: ['sms', 'wechat'],
        targetCount: 20 + Math.floor(Math.random() * 80),
        sentCount: 18 + Math.floor(Math.random() * 70),
        failedCount: Math.floor(Math.random() * 5),
        status: i === 0 ? 'processing' : 'completed',
        createdBy: creatorId || '张老师',
        createdAt: pastDate,
        finishedAt: i === 0 ? null : new Date(Date.now() - i * 86400000 * 2 + 3600000).toISOString(),
      });
    }
  }

  // Filtering
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  if (startDate) {
    tasks = tasks.filter(t => t.createdAt >= startDate);
  }
  if (endDate) {
    tasks = tasks.filter(t => t.createdAt <= endDate + 'T23:59:59.999Z');
  }
  if (creatorId) {
    tasks = tasks.filter(t => t.createdBy === creatorId || t.createdBy?.includes(creatorId));
  }

  const total = tasks.length;
  const start = (pageNum - 1) * pageSize;
  const items = tasks.slice(start, start + pageSize).map(t => ({
    taskId: t.taskId,
    taskName: t.taskName,
    channels: t.channels,
    targetCount: t.targetCount,
    sentCount: t.sentCount,
    failedCount: t.failedCount,
    status: t.status,
    createdBy: t.createdBy,
    createdAt: t.createdAt,
    finishedAt: t.finishedAt,
  }));

  return okCtx(c, { items, total, pageNum, pageSize, totalPages: Math.ceil(total / pageSize) });
});

// GET /reminders/records — 催缴记录列表
reminders.get('/reminders/records', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const studentId = c.req.query('studentId');
  const billId = c.req.query('billId');
  const taskId = c.req.query('taskId');
  const channel = c.req.query('channel');
  const sendStatus = c.req.query('sendStatus');
  const pageNum = Number(c.req.query('pageNum') || 1);
  const pageSize = Number(c.req.query('pageSize') || 20);

  let records = [...reminderRecords];

  // If no records yet, generate mock records
  if (records.length === 0) {
    const channels = ['sms', 'wechat', 'site'];
    const templates = ['default_urge', 'final_notice', 'friendly_reminder'];
    const statuses = ['success', 'success', 'success', 'failed'];
    const operators = ['张老师', '李老师', '王主任', '招生办'];
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
    ];

    for (let i = 0; i < 25; i++) {
      const s = mockStudents[i % mockStudents.length];
      const st = statuses[Math.floor(Math.random() * statuses.length)];
      records.push({
        reminderId: `REM_${Date.now() - i * 10000}_${Math.random().toString(36).slice(2, 6)}`,
        studentId: s.id,
        studentNo: s.no,
        studentName: s.name,
        billId: ['tuition', 'dorm', 'book', 'medical'][Math.floor(Math.random() * 4)],
        amount: [5200, 1200, 800, 180][Math.floor(Math.random() * 4)],
        channel: channels[Math.floor(Math.random() * channels.length)],
        templateCode: templates[Math.floor(Math.random() * templates.length)],
        sendStatus: st,
        failureReason: st === 'failed' ? '通道不可用' : null,
        sentAt: new Date(Date.now() - i * 3600000 * 3).toISOString(),
        operatorName: operators[Math.floor(Math.random() * operators.length)],
      });
    }
  }

  // Try to enrich records with real student data from DB
  try {
    const studentRows = await db.execute(sql`
      SELECT student_no, name FROM t_data_student WHERE delete_flag = 0
    `);
    const dbStudents = (studentRows as any[]);
    if (dbStudents.length > 0 && records.length === 0) {
      for (const s of dbStudents.slice(0, 20)) {
        records.push({
          reminderId: generateId('REM'),
          studentId: String(s.id || s.student_no),
          studentNo: s.student_no,
          studentName: s.name,
          billId: 'tuition',
          amount: 5200,
          channel: 'sms',
          templateCode: 'default_urge',
          sendStatus: 'success',
          failureReason: null,
          sentAt: new Date().toISOString(),
          operatorName: staff.name,
        });
      }
    }
  } catch { /* use mock data */ }

  // Filtering
  if (studentId) {
    records = records.filter(r => r.studentId === studentId || r.studentNo === studentId);
  }
  if (billId) {
    records = records.filter(r => r.billId === billId);
  }
  if (taskId) {
    records = records.filter(r => r.taskId === taskId);
  }
  if (channel) {
    records = records.filter(r => r.channel?.includes(channel));
  }
  if (sendStatus) {
    records = records.filter(r => r.sendStatus === sendStatus);
  }

  const total = records.length;
  const start = (pageNum - 1) * pageSize;
  const items = records.slice(start, start + pageSize).map(r => ({
    reminderId: r.reminderId,
    studentId: r.studentId,
    studentNo: r.studentNo,
    studentName: r.studentName,
    billId: r.billId,
    amount: r.amount,
    channel: r.channel,
    templateCode: r.templateCode,
    sendStatus: r.sendStatus,
    failureReason: r.failureReason,
    sentAt: r.sentAt,
    operatorName: r.operatorName,
  }));

  return okCtx(c, { items, total, pageNum, pageSize, totalPages: Math.ceil(total / pageSize) });
});

export default reminders;
