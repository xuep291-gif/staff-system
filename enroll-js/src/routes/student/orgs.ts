import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { okCtx, failCtx } from '../../lib/response.js';

const orgs = new Hono();

// API-045: GET /api/student/orgs — 院系列表
orgs.get('/api/student/orgs', async (c) => {
  // Try t_sys_org with level='college' first (org-master convention)
  const colleges = await db.execute(sql`
    SELECT id, name, full_name, note, level, org_type
    FROM t_sys_org
    WHERE delete_flag = 0 AND level = 'college'
    ORDER BY id
  `);
  if ((colleges as any[]).length > 0) {
    return okCtx(c, {
      orgs: (colleges as any[]).map(o => ({
        id: o.id,
        name: o.name,
        desc: o.note || o.full_name || '',
      })),
    });
  }

  // Fallback: any org with org_type=3 (Department) as colleges
  const depts = await db.execute(sql`
    SELECT id, name, full_name, note FROM t_sys_org
    WHERE delete_flag = 0 AND org_type = 3
    ORDER BY id
  `);
  if ((depts as any[]).length > 0) {
    return okCtx(c, {
      orgs: (depts as any[]).map(o => ({
        id: o.id,
        name: o.name,
        desc: o.note || o.full_name || '',
      })),
    });
  }

  // Last fallback: return first-level children of root orgs
  const children = await db.execute(sql`
    SELECT id, name, full_name, note FROM t_sys_org
    WHERE delete_flag = 0 AND pid IN (SELECT id FROM t_sys_org WHERE pid IS NULL AND delete_flag = 0)
    ORDER BY id
  `);
  if ((children as any[]).length > 0) {
    return okCtx(c, {
      orgs: (children as any[]).map(o => ({
        id: o.id,
        name: o.name,
        desc: o.note || o.full_name || '',
      })),
    });
  }

  return okCtx(c, { orgs: [] });
});

// API-046: GET /api/student/communities — 班级/专业列表
orgs.get('/api/student/communities', async (c) => {
  const orgId = c.req.query('orgId');
  if (!orgId) return failCtx(c, '缺少院系ID');

  const oid = Number(orgId);

  // Try t_sys_org: children of the given college (level=class or level=major)
  const children = await db.execute(sql`
    SELECT id, name, full_name, note, level
    FROM t_sys_org
    WHERE delete_flag = 0 AND pid = ${oid}
    ORDER BY id
  `);
  if ((children as any[]).length > 0) {
    return okCtx(c, {
      communities: (children as any[]).map(o => ({
        id: o.id,
        name: o.name,
        desc: o.note || o.full_name || '',
        major: o.level || '',
      })),
    });
  }

  // Try t_data_org_college_class
  const classes = await db.execute(sql`
    SELECT id, code, name, grade, college_id, major_id
    FROM t_data_org_college_class
    WHERE college_id = ${oid} AND COALESCE(disabled, 0) = 0
    ORDER BY grade DESC, name ASC
  `);
  if ((classes as any[]).length > 0) {
    return okCtx(c, {
      communities: (classes as any[]).map(c => ({
        id: c.id,
        name: c.name || `${c.grade || ''}级 ${c.code || ''}`,
        desc: '',
        major: c.code || '',
      })),
    });
  }

  // Try t_data_class
  const clsRows = await db.execute(sql`
    SELECT id, class_no, class_name, grade, major
    FROM t_data_class
    WHERE disabled = '0' AND delete_flag = '0'
    ORDER BY grade DESC, class_name ASC
    LIMIT 50
  `);
  if ((clsRows as any[]).length > 0) {
    return okCtx(c, {
      communities: (clsRows as any[]).map(c => ({
        id: c.id,
        name: c.class_name || c.class_no || '',
        desc: '',
        major: c.major || '',
      })),
    });
  }

  return okCtx(c, { communities: [] });
});

export default orgs;
