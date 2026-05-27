import { Hono } from 'hono';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

const teachers = new Hono();

// GET /api/teachers/:teacherNo/classes — query classes by teacher number
teachers.get('/api/teachers/:teacherNo/classes', async (c) => {
  const teacherNo = c.req.param('teacherNo');

  // Look up teacher by teacher_no
  const teacherRows = await db.execute(sql`
    SELECT id, teacher_no, name FROM t_data_teacher
    WHERE teacher_no = ${teacherNo}
    LIMIT 1
  `);

  if ((teacherRows as any[]).length === 0) {
    return c.json({ error: `Teacher not found: ${teacherNo}` }, 404);
  }

  const teacher = (teacherRows as any[])[0];

  // Find classes linked to this teacher via t_data_org_college_class
  const classRows = await db.execute(sql`
    SELECT
      c.id,
      c.code,
      c.name,
      c.grade,
      c.college_id,
      c.major_id,
      c.disabled,
      c.created_at,
      c.updated_at
    FROM t_data_org_college_class c
    WHERE c.teacher_id = ${teacher.id}
    ORDER BY c.grade DESC, c.name ASC
  `);

  return c.json({
    teacher: {
      id: teacher.id,
      teacher_no: teacher.teacher_no,
      name: teacher.name,
    },
    classes: classRows as any[],
    total: (classRows as any[]).length,
  });
});

export default teachers;
