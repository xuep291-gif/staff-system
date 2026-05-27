import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';
import { getEavRows } from '../../lib/eav.js';

const dormitories = new Hono();

// ──────────────────────── helpers ────────────────────────

function paginate<T>(items: T[], pageNum: number, pageSize: number) {
  const num = Math.max(1, pageNum || 1);
  const size = Math.max(1, Math.min(pageSize || 10, 100));
  const total = items.length;
  const totalPage = Math.ceil(total / size);
  const start = (num - 1) * size;
  const page = items.slice(start, start + size);
  return { items: page, total, pageNum: num, pageSize: size, totalPage };
}

function nowISO() {
  return new Date().toISOString();
}

// ─────── mock data generators ───────

const MALE_NAMES = ['张伟', '李强', '王磊', '刘洋', '陈浩', '杨帆', '赵明', '黄杰', '周涛', '吴鑫',
  '许睿', '何俊', '冯凯', '孙博', '钱鹏', '郑浩', '韩冰', '曹亮', '彭宇', '董哲'];
const FEMALE_NAMES = ['李娜', '王芳', '张敏', '刘静', '陈雪', '杨柳', '赵丽', '黄婷', '周颖', '吴瑶',
  '许晴', '何琳', '冯娟', '孙悦', '钱蕾', '郑秀', '韩梅', '曹颖', '彭菲', '董露'];

function mockStudents() {
  const students: any[] = [];
  for (let i = 0; i < 20; i++) {
    const isMale = i < 10;
    students.push({
      studentId: `STU2024${String(i + 1).padStart(4, '0')}`,
      studentNo: `2024010${String(i + 1).padStart(3, '0')}`,
      studentName: isMale ? MALE_NAMES[i] : FEMALE_NAMES[i - 10],
      gender: isMale ? '男' : '女',
      className: i < 7 ? '计算机科学2024-1班' : i < 14 ? '软件工程2024-2班' : '人工智能2024-1班',
      buildingName: i < 8 ? '1号楼(毓秀楼)' : i < 15 ? '3号楼(蕙质楼)' : null,
      roomNo: i < 8 ? `30${i + 1}` : i < 15 ? `40${i - 7}` : null,
      bedNo: i < 15 ? String((i % 4) + 1) : null,
      dormText: i < 8 ? '1号楼 301室 1号床' : i < 15 ? '3号楼 401室 2号床' : null,
      dormFee: 1200,
      status: i < 13 ? 'assigned' : i < 16 ? 'unassigned' : 'non_dorm',
    });
  }
  return students;
}

function mockBuildings() {
  return [
    { buildingId: 'BLD001', buildingName: '1号楼(毓秀楼)', genderLimit: '男', floorCount: 6, roomCount: 120, bedCount: 480, availableBedCount: 32 },
    { buildingId: 'BLD002', buildingName: '2号楼(博学楼)', genderLimit: '男', floorCount: 6, roomCount: 110, bedCount: 440, availableBedCount: 18 },
    { buildingId: 'BLD003', buildingName: '3号楼(蕙质楼)', genderLimit: '女', floorCount: 7, roomCount: 140, bedCount: 560, availableBedCount: 45 },
    { buildingId: 'BLD004', buildingName: '4号楼(兰心楼)', genderLimit: '女', floorCount: 6, roomCount: 100, bedCount: 400, availableBedCount: 12 },
  ];
}

function mockRooms(buildingId: string) {
  const rooms: any[] = [];
  const base = buildingId === 'BLD001' ? 1 : buildingId === 'BLD002' ? 2 : buildingId === 'BLD003' ? 3 : 4;
  for (let floor = 1; floor <= 3; floor++) {
    for (let r = 1; r <= 4; r++) {
      const roomNo = `${floor}0${r}`;
      const capacity = 4;
      const occupied = Math.floor(Math.random() * capacity);
      rooms.push({
        roomId: `RM_${base}_${floor}_${r}`,
        roomNo,
        floor,
        capacity,
        occupiedCount: occupied,
        availableBedCount: capacity - occupied,
        feeStandard: 1200,
        beds: Array.from({ length: capacity }, (_, bi) => ({
          bedId: `BED_${base}_${floor}_${r}_${bi + 1}`,
          bedNo: `${bi + 1}`,
          status: bi < occupied ? 'occupied' : 'available',
          occupantName: bi < occupied ? (base <= 2 ? MALE_NAMES[bi] : FEMALE_NAMES[bi]) : null,
        })),
      });
    }
  }
  return rooms;
}

function mockRoomChangeApplications() {
  const now = Date.now();
  return [
    {
      applicationId: 'RC_001_pending_zhangwei',
      studentId: 'STU20240001',
      studentNo: '2024010001',
      studentName: '张伟',
      oldDorm: { building: '1号楼(毓秀楼)', room: '301', bed: '1' },
      targetDorm: { building: '3号楼(蕙质楼)', room: '402', bed: '3' },
      reason: '与室友作息不一致，希望调换宿舍',
      status: 'pending',
      applyTime: new Date(now - 86400000 * 2).toISOString(),
      statusLabel: '待审批',
    },
    {
      applicationId: 'RC_002_approved_chenhao',
      studentId: 'STU20240005',
      studentNo: '2024010005',
      studentName: '陈浩',
      oldDorm: { building: '2号楼(博学楼)', room: '205', bed: '2' },
      targetDorm: { building: '2号楼(博学楼)', room: '508', bed: '1' },
      reason: '专业调整，希望搬到同专业同学集中楼层',
      status: 'approved',
      applyTime: new Date(now - 86400000 * 5).toISOString(),
      statusLabel: '已通过',
    },
    {
      applicationId: 'RC_003_rejected_huangjie',
      studentId: 'STU20240008',
      studentNo: '2024010008',
      studentName: '黄杰',
      oldDorm: { building: '1号楼(毓秀楼)', room: '308', bed: '4' },
      targetDorm: { building: '2号楼(博学楼)', room: '312', bed: '2' },
      reason: '原宿舍靠近楼道噪音大',
      status: 'rejected',
      applyTime: new Date(now - 86400000 * 7).toISOString(),
      statusLabel: '已驳回',
    },
    {
      applicationId: 'RC_004_pending_hejun',
      studentId: 'STU20240012',
      studentNo: '2024010012',
      studentName: '何俊',
      oldDorm: { building: '3号楼(蕙质楼)', room: '405', bed: '1' },
      targetDorm: { building: '4号楼(兰心楼)', room: '302', bed: '4' },
      reason: '跟同学一起搬到同一栋楼',
      status: 'pending',
      applyTime: new Date(now - 86400000).toISOString(),
      statusLabel: '待审批',
    },
  ];
}

function mockWithdrawApplications() {
  const now = Date.now();
  return [
    {
      applicationId: 'WD_001_pending_sunbo',
      studentId: 'STU20240015',
      studentNo: '2024010015',
      studentName: '孙博',
      currentDorm: { building: '1号楼(毓秀楼)', room: '402', bed: '3' },
      reason: '家庭住址离校较近，申请退宿走读',
      status: 'pending',
      applyTime: new Date(now - 86400000 * 3).toISOString(),
      statusLabel: '待审批',
    },
    {
      applicationId: 'WD_002_approved_pengyu',
      studentId: 'STU20240018',
      studentNo: '2024010018',
      studentName: '彭宇',
      currentDorm: { building: '2号楼(博学楼)', room: '501', bed: '1' },
      reason: '身体原因需校外休养',
      status: 'approved',
      applyTime: new Date(now - 86400000 * 10).toISOString(),
      statusLabel: '已通过',
    },
    {
      applicationId: 'WD_003_rejected_wanglei',
      studentId: 'STU20240003',
      studentNo: '2024010003',
      studentName: '王磊',
      currentDorm: { building: '1号楼(毓秀楼)', room: '303', bed: '2' },
      reason: '计划租房备考研究生',
      status: 'rejected',
      applyTime: new Date(now - 86400000 * 8).toISOString(),
      statusLabel: '已驳回',
    },
  ];
}

const roomChangeApplicationStore = mockRoomChangeApplications();
const withdrawApplicationStore = mockWithdrawApplications();

function mockNonDormApplications() {
  const now = Date.now();
  return [
    {
      applicationId: 'ND_001_pending_donglu',
      studentId: 'STU20240020',
      studentNo: '2024010020',
      studentName: '董露',
      currentDorm: null,
      reason: '家在本地，申请校外住宿',
      outsideAddress: '江苏省南京市鼓楼区汉口路22号',
      guardianPhone: '139****5678',
      leaseStartDate: '2024-09-01',
      leaseEndDate: '2025-01-15',
      materials: ['家长知情同意书.pdf', '租房合同.pdf', '身份证复印件.pdf'],
      currentNode: 'teacher_review',
      status: 'pending',
      applyTime: new Date(now - 86400000 * 4).toISOString(),
      statusLabel: '待审批',
    },
    {
      applicationId: 'ND_002_firstpass_wuyao',
      studentId: 'STU20240010',
      studentNo: '2024010010',
      studentName: '吴瑶',
      currentDorm: null,
      reason: '父母工作调动至本地，申请校外同住',
      outsideAddress: '江苏省南京市江宁区将军大道29号',
      guardianPhone: '138****1234',
      leaseStartDate: '2024-09-01',
      leaseEndDate: '2025-07-01',
      materials: ['家长知情同意书.pdf', '家长工作证明.pdf', '房产证复印件.pdf'],
      currentNode: 'government_review',
      status: 'first_pass',
      applyTime: new Date(now - 86400000 * 6).toISOString(),
      statusLabel: '教师已通过',
    },
    {
      applicationId: 'ND_003_pending_zhaoming',
      studentId: 'STU20240007',
      studentNo: '2024010007',
      studentName: '赵明',
      currentDorm: null,
      reason: '实习单位离校较远，申请校外住宿',
      outsideAddress: '江苏省南京市栖霞区仙林大道163号',
      guardianPhone: '137****9012',
      leaseStartDate: '2024-09-15',
      leaseEndDate: '2025-02-28',
      materials: ['家长知情同意书.pdf', '实习证明.pdf', '租房合同.pdf'],
      currentNode: 'teacher_review',
      status: 'pending',
      applyTime: new Date(now - 86400000).toISOString(),
      statusLabel: '待审批',
    },
    {
      applicationId: 'ND_004_rejected_zhoutao',
      studentId: 'STU20240009',
      studentNo: '2024010009',
      studentName: '周涛',
      currentDorm: null,
      reason: '身体特殊需求，需校外居住',
      outsideAddress: '江苏省南京市玄武区北京东路1号',
      guardianPhone: '136****3456',
      leaseStartDate: '2024-09-01',
      leaseEndDate: '2025-07-01',
      materials: ['家长知情同意书.pdf', '医院证明.pdf', '租房合同.pdf'],
      currentNode: 'rejected',
      status: 'rejected',
      applyTime: new Date(now - 86400000 * 12).toISOString(),
      statusLabel: '已驳回',
    },
  ];
}

function mockAuditLogs(statusHistory: string[], appType: string) {
  const now = Date.now();
  return statusHistory.map((s, i) => ({
    logId: `AL_${now}_${i}`,
    action: s === 'approved' || s === 'first_pass' ? 'approve' : s === 'rejected' ? 'reject' : 'submit',
    operator: i === 0 ? '学生本人' : i === 1 ? '班主任 李明辉' : '学工处 王处长',
    operatorRole: i === 0 ? 'student' : i === 1 ? 'teacher' : 'government',
    remark: i === 0 ? '提交申请' : s === 'approved' ? '审核通过，同意调换' : s === 'first_pass' ? '初审通过，转校级审批' : '不符合条件，予以驳回',
    createdAt: new Date(now - 86400000 * (statusHistory.length - i)).toISOString(),
  }));
}

// ─────────────────────────────────────────────────────────
//  1. GET /dormitories/students — Dormitory student list
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitories/students', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const classId = c.req.query('classId');
  const buildingId = c.req.query('buildingId');
  const status = c.req.query('status');
  const keyword = c.req.query('keyword');
  const pageNum = parseInt(c.req.query('pageNum') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '10', 10);

  let students = mockStudents();

  // Try DB first
  try {
    const studentRows = await db.execute(sql`
      SELECT s.student_no, s.name, s.gender, s.class_name, s.building_id, s.room_no, s.bed_no, s.dorm_status, s.dorm_fee
      FROM t_data_student s
      WHERE s.delete_flag = 0
      ORDER BY s.student_no
    `);
    if ((studentRows as any[]).length > 0) {
      const buildings = await getEavRows('building_info');
      const buildingMap = new Map<string, string>();
      for (const b of buildings) buildingMap.set(b._rowId, b.building_name || '');

      students = (studentRows as any[]).map((r: any, i: number) => ({
        studentId: r.student_no || `STU${i}`,
        studentNo: r.student_no || '',
        studentName: r.name || '',
        gender: r.gender || '',
        className: r.class_name || '',
        buildingName: buildingMap.get(r.building_id) || null,
        roomNo: r.room_no || null,
        bedNo: r.bed_no || null,
        dormText: r.building_id ? `${buildingMap.get(r.building_id) || ''} ${r.room_no || ''}室 ${r.bed_no || ''}号床` : null,
        dormFee: Number(r.dorm_fee) || 1200,
        status: r.dorm_status || 'unassigned',
      }));
    }
  } catch {
    // use mocks
  }

  // Filters
  if (status && status !== 'all') {
    students = students.filter(s => s.status === status);
  }
  if (classId) {
    students = students.filter(s => s.className.includes(classId));
  }
  if (buildingId) {
    students = students.filter(s => s.buildingName && s.buildingName.includes(buildingId));
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    students = students.filter(s =>
      s.studentName.includes(kw) || s.studentNo.includes(kw) || s.studentId.includes(kw),
    );
  }

  const result = paginate(students, pageNum, pageSize);
  return okCtx(c, result);
});

// ─────────────────────────────────────────────────────────
//  2. GET /dormitories/students/:studentId — Student dorm detail
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitories/students/:studentId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { studentId } = c.req.param();
  const allStudents = mockStudents();
  const student = allStudents.find(s => s.studentId === studentId);

  if (!student) return failCtx(c, '学生不存在', 40400, 404);

  const now = Date.now();
  const currentDorm = student.status === 'assigned'
    ? {
        building: student.buildingName,
        room: student.roomNo,
        bed: student.bedNo,
        fee: student.dormFee,
      }
    : null;

  const history = student.status === 'assigned'
    ? [
        { type: 'assign', oldDorm: null, newDorm: `1号楼 301室 1号床`, reason: '新生统一分配', status: 'completed', appliedAt: new Date(now - 86400000 * 180).toISOString() },
      ]
    : student.status === 'non_dorm'
    ? [
        { type: 'withdraw', oldDorm: '1号楼 308室 4号床', newDorm: null, reason: '申请校外住宿', status: 'completed', appliedAt: new Date(now - 86400000 * 60).toISOString() },
      ]
    : [];

  const feeStandard = {
    standardFee: 1200,
    currentFee: student.dormFee,
    discountReason: null,
  };

  const diffOrders: any[] = student.status === 'assigned' ? [] : [
    {
      diffOrderId: `DF_${now}`,
      type: 'refund',
      amount: 600,
      reason: '退宿退费（按剩余月份折算）',
      status: 'pending',
      createdAt: new Date(now - 86400000 * 30).toISOString(),
    },
  ];

  return okCtx(c, {
    student: {
      studentId: student.studentId,
      studentNo: student.studentNo,
      studentName: student.studentName,
      gender: student.gender,
      className: student.className,
      phone: '138****' + String(Math.floor(Math.random() * 9000 + 1000)),
    },
    currentDorm,
    history,
    feeStandard,
    diffOrders,
  });
});

// ─────────────────────────────────────────────────────────
//  3. GET /dormitories/buildings — Building list
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitories/buildings', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  let buildings = mockBuildings();

  try {
    const eavBuildings = await getEavRows('building_info');
    if (eavBuildings.length > 0) {
      buildings = eavBuildings.map((b, i) => {
        const totalRooms = parseInt(b.total_rooms || '0', 10);
        const capacity = parseInt(b.capacity_per_room || '4', 10);
        const bedCount = totalRooms * capacity;
        return {
          buildingId: b._rowId || `BLD${String(i + 1).padStart(3, '0')}`,
          buildingName: b.building_name || `Building ${i + 1}`,
          genderLimit: b.gender_limit === '1' ? '男' : b.gender_limit === '2' ? '女' : '不限',
          floorCount: parseInt(b.floors || '6', 10),
          roomCount: totalRooms,
          bedCount,
          availableBedCount: Math.floor(bedCount * (Math.random() * 0.3 + 0.05)),
        };
      });
    }
  } catch {
    // use mocks
  }

  return okCtx(c, { items: buildings });
});

// ─────────────────────────────────────────────────────────
//  4. GET /dormitories/buildings/:buildingId/rooms — Building rooms
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitories/buildings/:buildingId/rooms', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { buildingId } = c.req.param();

  let rooms = mockRooms(buildingId);

  try {
    const eavRooms = await getEavRows('building_room');
    const filtered = eavRooms.filter(r => r.building_id === buildingId && r.disabled === '0');
    if (filtered.length > 0) {
      const beds = await getEavRows('building_room_bed');
      rooms = filtered.map(r => {
        const roomBeds = beds
          .filter(b => b.room_id === r._rowId && b.disabled === '0')
          .map(b => ({
            bedId: b._rowId || `BED_${Math.random().toString(36).slice(2, 8)}`,
            bedNo: b.bed_no || '',
            status: b.status === 'OCCUPIED' ? 'occupied' : 'available',
            occupantName: b.occupant_name || null,
          }));
        const capacity = parseInt(r.capacity || '4', 10);
        const occupiedCount = roomBeds.filter(b => b.status === 'occupied').length;
        return {
          roomId: r._rowId,
          roomNo: r.room_no || '',
          floor: parseInt(r.floor || '1', 10),
          capacity,
          occupiedCount,
          availableBedCount: capacity - occupiedCount,
          feeStandard: parseInt(r.fee_standard || '1200', 10),
          beds: roomBeds,
        };
      });
    }
  } catch {
    // use mocks
  }

  return okCtx(c, { items: rooms });
});

// ═══════════════════════════════════════════════════════
//  Room Change Applications (5-8)
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
//  5. GET /dormitory/room-change-applications — Room change applications list
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitory/room-change-applications', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const role = c.req.query('role');
  const status = c.req.query('status');
  const keyword = c.req.query('keyword');
  const classId = c.req.query('classId');
  const departmentId = c.req.query('departmentId');
  const pageNum = parseInt(c.req.query('pageNum') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '10', 10);

  let apps = [...roomChangeApplicationStore];

  // Try DB
  try {
    const dbApps = await db.execute(sql`
      SELECT * FROM t_data_student WHERE room_change_status IS NOT NULL
    `);
    if ((dbApps as any[]).length > 0) {
      apps = (dbApps as any[]).map((r: any, idx: number) => ({
        applicationId: `RC_DB_${idx + 1}_${r.student_no || idx}`,
        studentId: r.student_no || '',
        studentNo: r.student_no || '',
        studentName: r.name || '',
        oldDorm: { building: r.building_name || '', room: r.room_no || '', bed: r.bed_no || '' },
        targetDorm: { building: '', room: '', bed: '' },
        reason: r.room_change_reason || '',
        status: r.room_change_status || 'pending',
        applyTime: r.room_change_time || nowISO(),
        statusLabel: r.room_change_status === 'approved' ? '已通过' : r.room_change_status === 'rejected' ? '已驳回' : '待审批',
      }));
    }
  } catch {
    // use mocks
  }

  // Filters
  if (status && status !== 'all') {
    apps = apps.filter(a => a.status === status);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    apps = apps.filter(a => a.studentName.includes(kw) || a.studentNo.includes(kw) || a.applicationId.includes(kw));
  }

  const result = paginate(apps, pageNum, pageSize);
  return okCtx(c, result);
});

// ─────────────────────────────────────────────────────────
//  6. GET /dormitory/room-change-applications/:applicationId — Room change detail
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitory/room-change-applications/:applicationId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const all = roomChangeApplicationStore;
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);

  const student = mockStudents().find(s => s.studentId === app.studentId);

  const detail = {
    ...app,
    student: student ? {
      studentId: student.studentId,
      studentNo: student.studentNo,
      studentName: student.studentName,
      gender: student.gender,
      className: student.className,
      phone: '138****' + String(Math.floor(Math.random() * 9000 + 1000)),
    } : null,
    oldDormDetail: {
      ...app.oldDorm,
      feeStandard: 1200,
      roomType: '四人间',
      floor: app.oldDorm.room.charAt(0),
    },
    targetDormDetail: {
      ...app.targetDorm,
      feeStandard: 1200,
      roomType: '四人间',
      floor: app.targetDorm.room.charAt(0),
    },
    materials: app.status === 'pending' ? ['换宿申请表.pdf'] : ['换宿申请表.pdf', '审批意见书.pdf'],
    auditLogs: mockAuditLogs(
      app.status === 'approved' ? ['pending', 'approved'] : app.status === 'rejected' ? ['pending', 'rejected'] : ['pending'],
      'room_change',
    ),
  };

  return okCtx(c, detail);
});

// ─────────────────────────────────────────────────────────
//  7. POST /dormitory/room-change-applications/:applicationId/approve
// ─────────────────────────────────────────────────────────
dormitories.post('/dormitory/room-change-applications/:applicationId/approve', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const { remark, generateDiffOrder } = await c.req.json().catch(() => ({}));
  const genOrder = generateDiffOrder !== false;

  // Find mock application
  const all = roomChangeApplicationStore;
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);
  if (app.status !== 'pending') return failCtx(c, '当前状态不允许审批', 40001);

  const oldStatus = app.status;
  const newStatus = 'approved';
  app.status = newStatus;
  app.statusLabel = '已通过';
  const now = Date.now();
  let diffOrderId: string | null = null;

  if (genOrder) {
    diffOrderId = `DF_${now}_${Math.random().toString(36).slice(2, 6)}`;
  }

  return okCtx(c, {
    applicationId,
    oldStatus,
    newStatus,
    dormitoryChanged: true,
    diffOrderId,
    statistics: {
      totalPending: roomChangeApplicationStore.filter(a => a.status === 'pending').length,
      todayApproved: 1,
      todayRejected: 0,
    },
  }, '审批通过');
});

// ─────────────────────────────────────────────────────────
//  8. POST /dormitory/room-change-applications/:applicationId/reject
// ─────────────────────────────────────────────────────────
dormitories.post('/dormitory/room-change-applications/:applicationId/reject', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const { remark } = await c.req.json().catch(() => ({}));

  const all = roomChangeApplicationStore;
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);
  if (app.status !== 'pending') return failCtx(c, '当前状态不允许审批', 40001);

  const oldStatus = app.status;
  const newStatus = 'rejected';
  app.status = newStatus;
  app.statusLabel = '已驳回';

  return okCtx(c, {
    applicationId,
    oldStatus,
    newStatus,
    remark: remark || '经审核，暂不符合换宿条件',
    statistics: {
      totalPending: roomChangeApplicationStore.filter(a => a.status === 'pending').length,
      todayApproved: 0,
      todayRejected: 1,
    },
  }, '已驳回');
});

// ═══════════════════════════════════════════════════════
//  Withdraw (退宿) Applications (9-12)
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
//  9. GET /dormitory/withdraw-applications — Withdraw list
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitory/withdraw-applications', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const role = c.req.query('role');
  const status = c.req.query('status');
  const keyword = c.req.query('keyword');
  const classId = c.req.query('classId');
  const departmentId = c.req.query('departmentId');
  const pageNum = parseInt(c.req.query('pageNum') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '10', 10);

  let apps = [...withdrawApplicationStore];

  try {
    const dbApps = await db.execute(sql`
      SELECT * FROM t_data_student WHERE dorm_status IN ('withdraw_pending', 'approved', 'rejected', 'withdrawn')
    `);
    if ((dbApps as any[]).length > 0) {
      apps = (dbApps as any[]).map((r: any, idx: number) => ({
        applicationId: `WD_DB_${idx + 1}_${r.student_no || idx}`,
        studentId: r.student_no || '',
        studentNo: r.student_no || '',
        studentName: r.name || '',
        currentDorm: { building: r.building_name || '', room: r.room_no || '', bed: r.bed_no || '' },
        reason: r.withdraw_reason || '',
        status: r.dorm_status === 'withdraw_pending' ? 'pending' : r.dorm_status === 'withdrawn' ? 'approved' : r.dorm_status || 'pending',
        applyTime: r.withdraw_time || nowISO(),
        statusLabel: r.dorm_status === 'approved' ? '已通过' : r.dorm_status === 'rejected' ? '已驳回' : r.dorm_status === 'withdrawn' ? '已完成' : '待审批',
      }));
    }
  } catch {
    // use mocks
  }

  if (status && status !== 'all') {
    apps = apps.filter(a => a.status === status);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    apps = apps.filter(a => a.studentName.includes(kw) || a.studentNo.includes(kw) || a.applicationId.includes(kw));
  }

  const result = paginate(apps, pageNum, pageSize);
  return okCtx(c, result);
});

// ─────────────────────────────────────────────────────────
//  10. GET /dormitory/withdraw-applications/:applicationId — Withdraw detail
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitory/withdraw-applications/:applicationId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const all = withdrawApplicationStore;
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);

  const student = mockStudents().find(s => s.studentId === app.studentId);

  return okCtx(c, {
    ...app,
    student: student ? {
      studentId: student.studentId,
      studentNo: student.studentNo,
      studentName: student.studentName,
      gender: student.gender,
      className: student.className,
      phone: '138****' + String(Math.floor(Math.random() * 9000 + 1000)),
    } : null,
    currentDormDetail: {
      ...app.currentDorm,
      feeStandard: 1200,
      roomType: '四人间',
      checkinDate: '2024-09-01',
    },
    materials: ['退宿申请表.pdf', '家长知情书.pdf'],
    feeImpact: {
      currentFee: 1200,
      refundAmount: 400,
      refundRatio: '33%',
      refundFormula: '按剩余住宿月数折算（已住5个月，剩余3个月，退还3/10）',
    },
    auditLogs: mockAuditLogs(
      app.status === 'approved' ? ['pending', 'approved'] : app.status === 'rejected' ? ['pending', 'rejected'] : ['pending'],
      'dorm_withdraw',
    ),
  });
});

// ─────────────────────────────────────────────────────────
//  11. POST /dormitory/withdraw-applications/:applicationId/approve — Approve withdraw
// ─────────────────────────────────────────────────────────
dormitories.post('/dormitory/withdraw-applications/:applicationId/approve', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const { remark } = await c.req.json().catch(() => ({}));

  const all = withdrawApplicationStore;
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);
  if (app.status !== 'pending') return failCtx(c, '当前状态不允许审批', 40001);

  const oldStatus = app.status;
  const newStatus = 'approved';
  app.status = newStatus;
  app.statusLabel = '已通过';
  const now = Date.now();
  const diffOrderId = `DF_${now}_${Math.random().toString(36).slice(2, 6)}`;

  return okCtx(c, {
    applicationId,
    oldStatus,
    newStatus,
    dormitoryChanged: true,
    diffOrderId,
    statistics: {
      totalPending: withdrawApplicationStore.filter(a => a.status === 'pending').length,
      todayApproved: 1,
      todayRejected: 0,
    },
  }, '退宿审批通过');
});

// ─────────────────────────────────────────────────────────
//  12. POST /dormitory/withdraw-applications/:applicationId/reject — Reject withdraw
// ─────────────────────────────────────────────────────────
dormitories.post('/dormitory/withdraw-applications/:applicationId/reject', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const { remark } = await c.req.json().catch(() => ({}));

  const all = withdrawApplicationStore;
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);
  if (app.status !== 'pending') return failCtx(c, '当前状态不允许审批', 40001);

  app.status = 'rejected';
  app.statusLabel = '已驳回';

  return okCtx(c, {
    applicationId,
    oldStatus: app.status,
    newStatus: 'rejected',
    remark: remark || '经审核，暂不符合退宿条件',
    statistics: {
      totalPending: withdrawApplicationStore.filter(a => a.status === 'pending').length,
      todayApproved: 0,
      todayRejected: 1,
    },
  }, '已驳回');
});

// ═══════════════════════════════════════════════════════
//  Non-Dorm (校外住宿) Applications (13-16)
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
//  13. GET /dormitory/non-dorm-applications — Non-dorm list
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitory/non-dorm-applications', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const role = c.req.query('role');
  const status = c.req.query('status');
  const keyword = c.req.query('keyword');
  const classId = c.req.query('classId');
  const departmentId = c.req.query('departmentId');
  const pageNum = parseInt(c.req.query('pageNum') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '10', 10);

  let apps = mockNonDormApplications();

  try {
    const dbApps = await db.execute(sql`
      SELECT * FROM t_data_student WHERE dorm_status IN ('non_dorm_pending', 'first_pass', 'approved', 'rejected', 'confirmed')
    `);
    if ((dbApps as any[]).length > 0) {
      apps = (dbApps as any[]).map((r: any, idx: number) => ({
        applicationId: `ND_DB_${idx + 1}_${r.student_no || idx}`,
        studentId: r.student_no || '',
        studentNo: r.student_no || '',
        studentName: r.name || '',
        currentDorm: null,
        reason: r.non_dorm_reason || '',
        outsideAddress: r.outside_address || '',
        guardianPhone: r.guardian_phone || '',
        leaseStartDate: r.lease_start || '',
        leaseEndDate: r.lease_end || '',
        materials: r.materials ? String(r.materials).split(',') : [],
        currentNode: r.dorm_status === 'first_pass' ? 'government_review' : r.dorm_status === 'approved' ? 'completed' : r.dorm_status === 'non_dorm_pending' ? 'teacher_review' : 'rejected',
        status: r.dorm_status === 'non_dorm_pending' ? 'pending' : r.dorm_status || 'pending',
        applyTime: r.non_dorm_time || nowISO(),
        statusLabel: r.dorm_status === 'first_pass' ? '教师已通过' : r.dorm_status === 'approved' ? '已通过' : r.dorm_status === 'rejected' ? '已驳回' : '待审批',
      }));
    }
  } catch {
    // use mocks
  }

  if (status && status !== 'all') {
    apps = apps.filter(a => a.status === status);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    apps = apps.filter(a => a.studentName.includes(kw) || a.studentNo.includes(kw) || a.applicationId.includes(kw));
  }

  const result = paginate(apps, pageNum, pageSize);
  return okCtx(c, result);
});

// ─────────────────────────────────────────────────────────
//  14. GET /dormitory/non-dorm-applications/:applicationId — Non-dorm detail
// ─────────────────────────────────────────────────────────
dormitories.get('/dormitory/non-dorm-applications/:applicationId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const all = mockNonDormApplications();
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);

  const student = mockStudents().find(s => s.studentId === app.studentId);

  // statusHistory varies by currentNode
  const statusHistory = app.status === 'first_pass'
    ? ['pending', 'first_pass']
    : app.status === 'rejected'
    ? ['pending', 'rejected']
    : app.status === 'approved'
    ? ['pending', 'first_pass', 'approved']
    : ['pending'];

  return okCtx(c, {
    ...app,
    student: student ? {
      studentId: student.studentId,
      studentNo: student.studentNo,
      studentName: student.studentName,
      gender: student.gender,
      className: student.className,
      phone: '138****' + String(Math.floor(Math.random() * 9000 + 1000)),
    } : null,
    emergencyContact: {
      name: '家长姓名',
      relationship: '父亲',
      phone: app.guardianPhone,
    },
    outsideAddressDetail: {
      address: app.outsideAddress,
      leaseStartDate: app.leaseStartDate,
      leaseEndDate: app.leaseEndDate,
      propertyType: '租赁',
    },
    approvalFlow: app.currentNode === 'teacher_review'
      ? { currentNode: 'teacher_review', currentNodeLabel: '班主任审批', nextNode: 'government_review', nextNodeLabel: '学工处审批' }
      : app.currentNode === 'government_review'
      ? { currentNode: 'government_review', currentNodeLabel: '学工处审批', nextNode: null, nextNodeLabel: null }
      : { currentNode: app.currentNode, currentNodeLabel: '已完成', nextNode: null, nextNodeLabel: null },
    auditLogs: mockAuditLogs(statusHistory, 'non_dorm'),
  });
});

// ─────────────────────────────────────────────────────────
//  15. POST /dormitory/non-dorm-applications/:applicationId/approve — Approve non-dorm
// ─────────────────────────────────────────────────────────
dormitories.post('/dormitory/non-dorm-applications/:applicationId/approve', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const { remark } = await c.req.json().catch(() => ({}));

  const all = mockNonDormApplications();
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);
  if (app.status !== 'pending') return failCtx(c, '当前状态不允许审批', 40001);

  const oldStatus = app.status;
  const newStatus = 'first_pass'; // Teacher approve → first_pass, enters government_review

  return okCtx(c, {
    applicationId,
    oldStatus,
    newStatus,
    currentNode: 'government_review',
    currentNodeLabel: '学工处审批',
    remark: remark || '班主任初审通过，转学工处复审',
    statistics: {
      totalPending: mockNonDormApplications().filter(a => a.status === 'pending').length - 1,
      todayApproved: 1,
      todayRejected: 0,
    },
  }, '初审通过，已转学工处复审');
});

// ─────────────────────────────────────────────────────────
//  16. POST /dormitory/non-dorm-applications/:applicationId/reject — Reject non-dorm
// ─────────────────────────────────────────────────────────
dormitories.post('/dormitory/non-dorm-applications/:applicationId/reject', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { applicationId } = c.req.param();
  const { remark } = await c.req.json().catch(() => ({}));

  const all = mockNonDormApplications();
  const app = all.find(a => a.applicationId === applicationId);
  if (!app) return failCtx(c, '申请不存在', 40400, 404);
  if (app.status !== 'pending') return failCtx(c, '当前状态不允许审批', 40001);

  return okCtx(c, {
    applicationId,
    oldStatus: app.status,
    newStatus: 'rejected',
    remark: remark || '经审核，不符合校外住宿条件，请重新提交申请',
    statistics: {
      totalPending: mockNonDormApplications().filter(a => a.status === 'pending').length - 1,
      todayApproved: 0,
      todayRejected: 1,
    },
  }, '已驳回');
});

export default dormitories;
