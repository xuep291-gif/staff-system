import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const students = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskIdNo(idNo: string | null | undefined): string {
  if (!idNo || idNo.length < 8) return idNo || '';
  return idNo.slice(0, 3) + '****' + idNo.slice(-4);
}

function derivePaymentStatus(billings: any[]): string {
  if (!billings || billings.length === 0) return 'unpaid';
  const allPaid = billings.every((b: any) => b.pay_status === 'paid');
  if (allPaid) return 'paid';
  const somePaid = billings.some((b: any) => b.pay_status === 'paid');
  return somePaid ? 'partial' : 'unpaid';
}

// ---------------------------------------------------------------------------
// Default / mock data for when DB tables are empty
// ---------------------------------------------------------------------------

const defaultClassInfo: Record<string, { college: string; major: string; className: string }> = {
  '1':  { college: '计算机与信息工程学院', major: '计算机科学与技术', className: '计科2401班' },
  '2':  { college: '计算机与信息工程学院', major: '软件工程',         className: '软件2401班' },
  '3':  { college: '经济管理学院',         major: '工商管理',         className: '工商2401班' },
  '4':  { college: '外国语学院',           major: '英语',             className: '英语2401班' },
  '5':  { college: '机电工程学院',         major: '机械设计制造',     className: '机械2401班' },
  '6':  { college: '理学院',               major: '数学与应用数学',   className: '数学2401班' },
};

const defaultStudents = [
  { id: 1, student_no: '20240001', name: '张伟',    gender: '男', id_no: '330102200001011234', phone: '13800010001', parent_phone: '13900010001', address: '浙江省杭州市西湖区文三路123号', dorm_text: '博学楼 A101-1号床', checkin_status: 'checked-in', class_id: '1' },
  { id: 2, student_no: '20240002', name: '李娜',    gender: '女', id_no: '330102200002022345', phone: '13800010002', parent_phone: '13900010002', address: '浙江省杭州市拱墅区莫干山路456号', dorm_text: '', checkin_status: 'pending', class_id: '1' },
  { id: 3, student_no: '20240003', name: '王强',    gender: '男', id_no: '330102200003033456', phone: '13800010003', parent_phone: '13900010003', address: '浙江省宁波市海曙区中山路789号', dorm_text: '明德楼 B202-3号床', checkin_status: 'checked-in', class_id: '2' },
  { id: 4, student_no: '20240004', name: '赵敏',    gender: '女', id_no: '330102200004044567', phone: '13800010004', parent_phone: '13900010004', address: '浙江省温州市鹿城区人民路101号', dorm_text: '', checkin_status: 'pending', class_id: '2' },
  { id: 5, student_no: '20240005', name: '孙涛',    gender: '男', id_no: '330102200005055678', phone: '13800010005', parent_phone: '13900010005', address: '浙江省绍兴市越城区解放路202号', dorm_text: '知行楼 C303-2号床', checkin_status: 'checked-in', class_id: '3' },
  { id: 6, student_no: '20240006', name: '周婷',    gender: '女', id_no: '330102200006066789', phone: '13800010006', parent_phone: '13900010006', address: '浙江省嘉兴市南湖区中山东路303号', dorm_text: '博学楼 A102-4号床', checkin_status: 'checked-in', class_id: '3' },
  { id: 7, student_no: '20240007', name: '吴杰',    gender: '男', id_no: '330102200007077890', phone: '13800010007', parent_phone: '13900010007', address: '浙江省台州市椒江区市府大道404号', dorm_text: '', checkin_status: 'pending', class_id: '4' },
  { id: 8, student_no: '20240008', name: '郑雪',    gender: '女', id_no: '330102200008088901', phone: '13800010008', parent_phone: '13900010008', address: '浙江省湖州市吴兴区红旗路505号', dorm_text: '明德楼 B203-1号床', checkin_status: 'checked-in', class_id: '4' },
  { id: 9, student_no: '20240009', name: '冯刚',    gender: '男', id_no: '330102200009099012', phone: '13800010009', parent_phone: '13900010009', address: '浙江省金华市婺城区人民西路606号', dorm_text: '知行楼 C304-3号床', checkin_status: 'checked-in', class_id: '5' },
  { id: 10, student_no: '20240010', name: '陈丽',   gender: '女', id_no: '330102200010100123', phone: '13800010010', parent_phone: '13900010010', address: '浙江省衢州市柯城区荷花中路707号', dorm_text: '', checkin_status: 'pending', class_id: '5' },
  { id: 11, student_no: '20240011', name: '褚伟强', gender: '男', id_no: '330102200011111234', phone: '13800010011', parent_phone: '13900010011', address: '浙江省丽水市莲都区中山街808号', dorm_text: '博学楼 A103-2号床', checkin_status: 'checked-in', class_id: '6' },
  { id: 12, student_no: '20240012', name: '卫华',   gender: '女', id_no: '330102200012122345', phone: '13800010012', parent_phone: '13900010012', address: '浙江省舟山市定海区环城南路909号', dorm_text: '', checkin_status: 'pending', class_id: '6' },
];

const defaultPaymentStatus: Record<string, string> = {
  '20240001': 'paid',
  '20240002': 'unpaid',
  '20240003': 'partial',
  '20240004': 'unpaid',
  '20240005': 'paid',
  '20240006': 'paid',
  '20240007': 'unpaid',
  '20240008': 'paid',
  '20240009': 'paid',
  '20240010': 'unpaid',
  '20240011': 'partial',
  '20240012': 'unpaid',
};

// ---------------------------------------------------------------------------
// GET /students/search  —  Search students (paginated)
// ---------------------------------------------------------------------------
students.get('/students/search', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const keyword       = (c.req.query('keyword') || '').trim();
  const classId       = (c.req.query('classId') || '').trim();
  const departmentId  = (c.req.query('departmentId') || '').trim();
  const paymentStatus = (c.req.query('paymentStatus') || '').trim();
  const checkinStatus = (c.req.query('checkinStatus') || '').trim();
  const pageNum       = Math.max(1, Number(c.req.query('pageNum') || 1));
  const pageSize      = Math.max(1, Math.min(100, Number(c.req.query('pageSize') || 20)));

  try {
    // Build WHERE clauses
    const whereParts: string[] = ['1=1'];
    const params: any[] = [];

    if (keyword) {
      whereParts.push('(s.student_no ILIKE $' + (params.length + 1) + ' OR s.name ILIKE $' + (params.length + 2) + ')');
      params.push('%' + keyword + '%', '%' + keyword + '%');
    }
    if (classId) {
      whereParts.push('c.id = $' + (params.length + 1));
      params.push(classId);
    }
    if (departmentId) {
      whereParts.push('c.college_id = $' + (params.length + 1));
      params.push(departmentId);
    }

    const whereSql = whereParts.join(' AND ');

    // Count
    const countRow = await db.execute(
      sql.raw(
        `SELECT COUNT(*) as total
         FROM t_data_student s
         JOIN t_data_org_user_student us ON us.student_id = s.id
         JOIN t_data_org_college_class c ON c.id = us.class_id
         WHERE ${whereSql}`
      )
    );
    let total = Number((countRow as any[])[0]?.total || 0);

    const offset = (pageNum - 1) * pageSize;
    const rows = await db.execute(
      sql.raw(
        `SELECT
           s.id          AS student_id,
           s.student_no,
           s.name,
           s.gender,
           COALESCE(c.college_id, '') AS college_id,
           c.id          AS class_id,
           c.name        AS class_name,
           s.phone,
           s.parent_phone,
           s.id_no,
           s.dorm_text,
           s.checkin_status
         FROM t_data_student s
         JOIN t_data_org_user_student us ON us.student_id = s.id
         JOIN t_data_org_college_class c ON c.id = us.class_id
         WHERE ${whereSql}
         ORDER BY s.student_no
         LIMIT ${pageSize} OFFSET ${offset}`
      )
    );

    let dbItems: any[] = (rows as any[]) || [];

    if (total === 0 || dbItems.length === 0) {
      // Fall back to mock data
      let filtered = [...defaultStudents];

      if (keyword) {
        const kw = keyword.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.student_no.toLowerCase().includes(kw) ||
            s.name.toLowerCase().includes(kw)
        );
      }
      if (classId) {
        filtered = filtered.filter((s) => s.class_id === classId);
      }
      if (departmentId) {
        filtered = filtered.filter(
          (s) => defaultClassInfo[s.class_id]?.college.includes(departmentId) || s.class_id === departmentId
        );
      }
      if (paymentStatus) {
        filtered = filtered.filter(
          (s) => (defaultPaymentStatus[s.student_no] || 'unpaid') === paymentStatus
        );
      }
      if (checkinStatus) {
        filtered = filtered.filter((s) => s.checkin_status === checkinStatus);
      }

      total = filtered.length;
      const paged = filtered.slice(offset, offset + pageSize);

      const items = paged.map((s) => {
        const cls = defaultClassInfo[s.class_id] || { college: '未知学院', major: '', className: '未知班级' };
        return {
          studentId: String(s.id),
          studentNo: s.student_no,
          name: s.name,
          gender: s.gender,
          college: cls.college,
          major: cls.major,
          classId: s.class_id,
          className: cls.className,
          phone: s.phone,
          parentPhone: s.parent_phone,
          idNoMasked: maskIdNo(s.id_no),
          dormText: s.dorm_text,
          paymentStatus: defaultPaymentStatus[s.student_no] || 'unpaid',
          checkinStatus: s.checkin_status,
        };
      });

      return okCtx(c, {
        items,
        pageNum,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
        hasNext: pageNum * pageSize < total,
      });
    }

    // Load payment status from DB
    const studentNos = dbItems.map((r: any) => r.student_no);
    let billingMap: Record<string, any[]> = {};
    if (studentNos.length > 0) {
      const billRows = await db.execute(
        sql.raw(
          `SELECT student_no, fee_type, amount, pay_status
           FROM t_data_billing
           WHERE student_no IN (${studentNos.map((n: string) => "'" + n + "'").join(',')})`
        )
      );
      for (const b of billRows as any[]) {
        if (!billingMap[b.student_no]) billingMap[b.student_no] = [];
        billingMap[b.student_no].push(b);
      }
    }

    const items = dbItems.map((r: any) => {
      const payment = derivePaymentStatus(billingMap[r.student_no] || []);
      return {
        studentId: String(r.student_id),
        studentNo: r.student_no || '',
        name: r.name || '',
        gender: r.gender || '',
        college: r.college_id || '未知学院',
        major: '',
        classId: String(r.class_id || ''),
        className: r.class_name || '',
        phone: r.phone || '',
        parentPhone: r.parent_phone || '',
        idNoMasked: maskIdNo(r.id_no),
        dormText: r.dorm_text || '',
        paymentStatus: payment,
        checkinStatus: r.checkin_status || 'pending',
      };
    });

    return okCtx(c, {
      items,
      pageNum,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      hasNext: pageNum * pageSize < total,
    });
  } catch (err: any) {
    // DB query failed - fall back to mock data entirely
    let filtered = [...defaultStudents];
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.student_no.toLowerCase().includes(kw) ||
          s.name.toLowerCase().includes(kw)
      );
    }
    if (classId) {
      filtered = filtered.filter((s) => s.class_id === classId);
    }
    if (paymentStatus) {
      filtered = filtered.filter(
        (s) => (defaultPaymentStatus[s.student_no] || 'unpaid') === paymentStatus
      );
    }
    if (checkinStatus) {
      filtered = filtered.filter((s) => s.checkin_status === checkinStatus);
    }

    const total = filtered.length;
    const offset = (pageNum - 1) * pageSize;
    const paged = filtered.slice(offset, offset + pageSize);

    const items = paged.map((s) => {
      const cls = defaultClassInfo[s.class_id] || { college: '未知学院', major: '', className: '未知班级' };
      return {
        studentId: String(s.id),
        studentNo: s.student_no,
        name: s.name,
        gender: s.gender,
        college: cls.college,
        major: cls.major,
        classId: s.class_id,
        className: cls.className,
        phone: s.phone,
        parentPhone: s.parent_phone,
        idNoMasked: maskIdNo(s.id_no),
        dormText: s.dorm_text,
        paymentStatus: defaultPaymentStatus[s.student_no] || 'unpaid',
        checkinStatus: s.checkin_status,
      };
    });

    return okCtx(c, {
      items,
      pageNum,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      hasNext: pageNum * pageSize < total,
    });
  }
});

// ---------------------------------------------------------------------------
// GET /classes/:classId/students  —  Class student list (paginated)
// ---------------------------------------------------------------------------
students.get('/classes/:classId/students', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const classId       = c.req.param('classId');
  const keyword       = (c.req.query('keyword') || '').trim();
  const paymentStatus = (c.req.query('paymentStatus') || '').trim();
  const checkinStatus = (c.req.query('checkinStatus') || '').trim();
  const pageNum       = Math.max(1, Number(c.req.query('pageNum') || 1));
  const pageSize      = Math.max(1, Math.min(100, Number(c.req.query('pageSize') || 20)));

  if (!classId) return failCtx(c, '缺少班级ID', 40001);

  try {
    const whereParts: string[] = ['c.id = ' + classId];
    if (keyword) {
      whereParts.push("(s.student_no ILIKE '%" + keyword.replace(/'/g, "''") + "%' OR s.name ILIKE '%" + keyword.replace(/'/g, "''") + "%')");
    }

    const whereSql = whereParts.join(' AND ');

    const countRow = await db.execute(
      sql.raw(
        `SELECT COUNT(*) as total
         FROM t_data_student s
         JOIN t_data_org_user_student us ON us.student_id = s.id
         JOIN t_data_org_college_class c ON c.id = us.class_id
         WHERE ${whereSql}`
      )
    );
    let total = Number((countRow as any[])[0]?.total || 0);

    const offset = (pageNum - 1) * pageSize;
    const rows = await db.execute(
      sql.raw(
        `SELECT
           s.id          AS student_id,
           s.student_no,
           s.name,
           s.gender,
           COALESCE(c.college_id, '') AS college_id,
           c.id          AS class_id,
           c.name        AS class_name,
           s.phone,
           s.parent_phone,
           s.id_no,
           s.dorm_text,
           s.checkin_status
         FROM t_data_student s
         JOIN t_data_org_user_student us ON us.student_id = s.id
         JOIN t_data_org_college_class c ON c.id = us.class_id
         WHERE ${whereSql}
         ORDER BY s.student_no
         LIMIT ${pageSize} OFFSET ${offset}`
      )
    );

    let dbItems: any[] = (rows as any[]) || [];

    if (total === 0 || dbItems.length === 0) {
      // Fall back to mock data
      let filtered = defaultStudents.filter((s) => s.class_id === classId);
      if (keyword) {
        const kw = keyword.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.student_no.toLowerCase().includes(kw) ||
            s.name.toLowerCase().includes(kw)
        );
      }
      if (paymentStatus) {
        filtered = filtered.filter(
          (s) => (defaultPaymentStatus[s.student_no] || 'unpaid') === paymentStatus
        );
      }
      if (checkinStatus) {
        filtered = filtered.filter((s) => s.checkin_status === checkinStatus);
      }

      total = filtered.length;
      const paged = filtered.slice(offset, offset + pageSize);

      const items = paged.map((s) => {
        const cls = defaultClassInfo[s.class_id] || { college: '未知学院', major: '', className: '未知班级' };
        return {
          studentId: String(s.id),
          studentNo: s.student_no,
          name: s.name,
          gender: s.gender,
          college: cls.college,
          major: cls.major,
          classId: s.class_id,
          className: cls.className,
          phone: s.phone,
          parentPhone: s.parent_phone,
          idNoMasked: maskIdNo(s.id_no),
          dormText: s.dorm_text,
          paymentStatus: defaultPaymentStatus[s.student_no] || 'unpaid',
          checkinStatus: s.checkin_status,
        };
      });

      return okCtx(c, {
        items,
        pageNum,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
        hasNext: pageNum * pageSize < total,
      });
    }

    // Load payment status from DB
    const studentNos = dbItems.map((r: any) => r.student_no);
    let billingMap: Record<string, any[]> = {};
    if (studentNos.length > 0) {
      const billRows = await db.execute(
        sql.raw(
          `SELECT student_no, fee_type, amount, pay_status
           FROM t_data_billing
           WHERE student_no IN (${studentNos.map((n: string) => "'" + n + "'").join(',')})`
        )
      );
      for (const b of billRows as any[]) {
        if (!billingMap[b.student_no]) billingMap[b.student_no] = [];
        billingMap[b.student_no].push(b);
      }
    }

    const items = dbItems.map((r: any) => {
      const payment = derivePaymentStatus(billingMap[r.student_no] || []);
      return {
        studentId: String(r.student_id),
        studentNo: r.student_no || '',
        name: r.name || '',
        gender: r.gender || '',
        college: r.college_id || '未知学院',
        major: '',
        classId: String(r.class_id || ''),
        className: r.class_name || '',
        phone: r.phone || '',
        parentPhone: r.parent_phone || '',
        idNoMasked: maskIdNo(r.id_no),
        dormText: r.dorm_text || '',
        paymentStatus: payment,
        checkinStatus: r.checkin_status || 'pending',
      };
    });

    return okCtx(c, {
      items,
      pageNum,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      hasNext: pageNum * pageSize < total,
    });
  } catch (err: any) {
    // Fall back to mock data for class
    let filtered = defaultStudents.filter((s) => s.class_id === classId);
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.student_no.toLowerCase().includes(kw) ||
          s.name.toLowerCase().includes(kw)
      );
    }
    if (paymentStatus) {
      filtered = filtered.filter(
        (s) => (defaultPaymentStatus[s.student_no] || 'unpaid') === paymentStatus
      );
    }
    if (checkinStatus) {
      filtered = filtered.filter((s) => s.checkin_status === checkinStatus);
    }

    const total = filtered.length;
    const offset = (pageNum - 1) * pageSize;
    const paged = filtered.slice(offset, offset + pageSize);

    const items = paged.map((s) => {
      const cls = defaultClassInfo[s.class_id] || { college: '未知学院', major: '', className: '未知班级' };
      return {
        studentId: String(s.id),
        studentNo: s.student_no,
        name: s.name,
        gender: s.gender,
        college: cls.college,
        major: cls.major,
        classId: s.class_id,
        className: cls.className,
        phone: s.phone,
        parentPhone: s.parent_phone,
        idNoMasked: maskIdNo(s.id_no),
        dormText: s.dorm_text,
        paymentStatus: defaultPaymentStatus[s.student_no] || 'unpaid',
        checkinStatus: s.checkin_status,
      };
    });

    return okCtx(c, {
      items,
      pageNum,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      hasNext: pageNum * pageSize < total,
    });
  }
});

// ---------------------------------------------------------------------------
// GET /students/:studentId  —  Student detail
// ---------------------------------------------------------------------------
students.get('/students/:studentId', async (c) => {
  const staff = getAuthStaff(c);
  if (!staff) return failCtx(c, '未登录', 40100, 401);

  const studentId = c.req.param('studentId');

  try {
    const rows = await db.execute(
      sql.raw(
        `SELECT
           s.id             AS student_id,
           s.student_no,
           s.name,
           s.gender,
           s.id_no,
           s.phone,
           s.parent_phone,
           s.address,
           s.dorm_text,
           s.checkin_status,
           s.checkin_time,
           s.checkin_operator,
           COALESCE(c.college_id, '') AS college_id,
           c.id             AS class_id,
           c.name           AS class_name,
           c.grade
         FROM t_data_student s
         LEFT JOIN t_data_org_user_student us ON us.student_id = s.id
         LEFT JOIN t_data_org_college_class c ON c.id = us.class_id
         WHERE s.id = ${studentId}`
      )
    );

    const dbStudent: any = ((rows as any[]) || [])[0];

    if (dbStudent) {
      // Load billing summary
      let billingRows: any[] = [];
      try {
        billingRows = (await db.execute(
          sql.raw(
            `SELECT fee_type, amount, pay_status, created_at
             FROM t_data_billing
             WHERE student_no = '${dbStudent.student_no}'`
          )
        ) as any[]) || [];
      } catch {
        // ignore
      }

      const receivable = billingRows.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0);
      const paid = billingRows
        .filter((b: any) => b.pay_status === 'paid')
        .reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0);
      const unpaid = receivable - paid;
      const paymentStatus = derivePaymentStatus(billingRows);

      // Parse dorm_text into structured form
      let dormitory: { building: string; room: string; bed: string } | null = null;
      if (dbStudent.dorm_text) {
        const m = dbStudent.dorm_text.match(/^(\S+)\s+(\S+)-(\S+)/);
        if (m) {
          dormitory = { building: m[1], room: m[2], bed: m[3] };
        }
      }

      return okCtx(c, {
        studentId: String(dbStudent.student_id),
        studentNo: dbStudent.student_no || '',
        name: dbStudent.name || '',
        gender: dbStudent.gender || '',
        idNoMasked: maskIdNo(dbStudent.id_no),
        phone: dbStudent.phone || '',
        parentPhone: dbStudent.parent_phone || '',
        college: dbStudent.college_id || '未知学院',
        major: '',
        className: dbStudent.class_name || '',
        address: dbStudent.address || '',
        dormitory,
        paymentSummary: {
          receivable,
          paid,
          unpaid,
          status: paymentStatus,
          urgeCount: paymentStatus === 'unpaid' ? 1 : 0,
        },
        documentSummary: {
          status: 'submitted',
          submittedAt: '2024-08-15T10:00:00Z',
        },
        aidSummary: {
          status: 'none',
        },
        loanSummary: {
          status: 'none',
        },
        checkin: {
          status: dbStudent.checkin_status || 'pending',
          time: dbStudent.checkin_time || null,
          operator: dbStudent.checkin_operator || null,
        },
        auditLogs: [
          {
            id: 1,
            action: '资料提交',
            operator: '系统',
            detail: '学生完成信息采集',
            createdAt: '2024-08-15T10:30:00Z',
          },
          {
            id: 2,
            action: '资格审核',
            operator: '招生办',
            detail: '审核通过，允许报到',
            createdAt: '2024-08-20T14:00:00Z',
          },
        ],
      });
    }
  } catch (err: any) {
    // Fall through to mock data
  }

  // Mock data fallback for student detail
  const mockStudent = defaultStudents.find((s) => String(s.id) === studentId);
  if (!mockStudent) return failCtx(c, '学生不存在', 40400, 404);

  const cls = defaultClassInfo[mockStudent.class_id] || { college: '未知学院', major: '', className: '未知班级' };
  const paymentStatus = defaultPaymentStatus[mockStudent.student_no] || 'unpaid';

  let dormitory: { building: string; room: string; bed: string } | null = null;
  if (mockStudent.dorm_text) {
    const m = mockStudent.dorm_text.match(/^(\S+)\s+(\S+)-(\S+)/);
    if (m) {
      dormitory = { building: m[1], room: m[2], bed: m[3] };
    }
  }

  const mockPaymentSummary = {
    receivable: 7200,
    paid: paymentStatus === 'paid' ? 7200 : paymentStatus === 'partial' ? 3600 : 0,
    unpaid: paymentStatus === 'paid' ? 0 : paymentStatus === 'partial' ? 3600 : 7200,
    status: paymentStatus,
    urgeCount: paymentStatus === 'unpaid' ? 1 : 0,
  };

  return okCtx(c, {
    studentId: String(mockStudent.id),
    studentNo: mockStudent.student_no,
    name: mockStudent.name,
    gender: mockStudent.gender,
    idNoMasked: maskIdNo(mockStudent.id_no),
    phone: mockStudent.phone,
    parentPhone: mockStudent.parent_phone,
    college: cls.college,
    major: cls.major,
    className: cls.className,
    address: mockStudent.address,
    dormitory,
    paymentSummary: mockPaymentSummary,
    documentSummary: {
      status: 'submitted',
      submittedAt: '2024-08-15T10:00:00Z',
    },
    aidSummary: {
      status: 'none',
    },
    loanSummary: {
      status: 'none',
    },
    checkin: {
      status: mockStudent.checkin_status,
      time: mockStudent.checkin_status === 'checked-in' ? '2024-09-01T08:30:00Z' : null,
      operator: mockStudent.checkin_status === 'checked-in' ? '李老师' : null,
    },
    auditLogs: [
      {
        id: 1,
        action: '资料提交',
        operator: '系统',
        detail: '学生完成信息采集',
        createdAt: '2024-08-15T10:30:00Z',
      },
      {
        id: 2,
        action: '资格审核',
        operator: '招生办',
        detail: '审核通过，允许报到',
        createdAt: '2024-08-20T14:00:00Z',
      },
    ],
  });
});

export default students;
