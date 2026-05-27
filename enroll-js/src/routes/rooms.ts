import { Hono } from 'hono';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

const rooms = new Hono();

async function getBuildingsFromEav(): Promise<any[]> {
  const rows = await db.execute(sql`
    SELECT v.row_id, a.attribute_name, v.field_value
    FROM t_eav_value v
    JOIN t_eav_attribute a ON a.id = v.attribute_id
    WHERE v.entity_id = 6 AND COALESCE(v.delete_flag, 0) = 0
    ORDER BY v.row_id, a.id
  `);
  const map = new Map<string, any>();
  for (const r of rows as any[]) {
    if (!map.has(r.row_id)) map.set(r.row_id, { _rowId: r.row_id });
    map.get(r.row_id)[r.attribute_name] = r.field_value;
  }
  return [...map.values()].filter(b => b.disabled === '0' && b.delete_flag === '0');
}

async function getFloorsFromEav(buildingId: string): Promise<any[]> {
  const rows = await db.execute(sql`
    SELECT v.row_id, a.attribute_name, v.field_value
    FROM t_eav_value v
    JOIN t_eav_attribute a ON a.id = v.attribute_id
    WHERE v.entity_id = 7 AND COALESCE(v.delete_flag, 0) = 0
    ORDER BY v.row_id, a.id
  `);
  const map = new Map<string, any>();
  for (const r of rows as any[]) {
    if (!map.has(r.row_id)) map.set(r.row_id, { _rowId: r.row_id });
    map.get(r.row_id)[r.attribute_name] = r.field_value;
  }
  return [...map.values()].filter(f => f.building_id === buildingId && f.disabled === '0' && f.delete_flag === '0');
}

async function getRoomsFromEav(floorId: string): Promise<any[]> {
  const rows = await db.execute(sql`
    SELECT v.row_id, a.attribute_name, v.field_value
    FROM t_eav_value v
    JOIN t_eav_attribute a ON a.id = v.attribute_id
    WHERE v.entity_id = 8 AND COALESCE(v.delete_flag, 0) = 0
    ORDER BY v.row_id, a.id
  `);
  const map = new Map<string, any>();
  for (const r of rows as any[]) {
    if (!map.has(r.row_id)) map.set(r.row_id, { _rowId: r.row_id });
    map.get(r.row_id)[r.attribute_name] = r.field_value;
  }
  return [...map.values()].filter(r => r.floor_id === floorId && r.disabled === '0' && r.delete_flag === '0');
}

/**
 * GET /api/rooms/report — Preview room generation report from EAV building data
 */
rooms.get('/api/rooms/report', async (c) => {
  try {
    const buildings = await getBuildingsFromEav();
    const details: any[] = [];

    for (const b of buildings) {
      const floors = await getFloorsFromEav(b.id || b._rowId);
      for (const f of floors) {
        const existingRooms = await getRoomsFromEav(f.id || f._rowId);
        details.push({
          building_code: b.code,
          building_name: b.name,
          floor: f.floor,
          floor_type: f.floor_type,
          floor_id: f.id || f._rowId,
          existing_rooms: existingRooms.length,
          existing_room_ids: existingRooms.map((r: any) => r.id || r._rowId),
        });
      }
    }

    const totalBuildings = buildings.length;
    const totalFloors = details.length;
    const totalRooms = details.reduce((s: number, d: any) => s + d.existing_rooms, 0);

    return c.json({
      summary: { totalBuildings, totalFloors, totalRooms },
      details,
    });
  } catch (e: any) {
    return c.json({ error: 'Building data not available: ' + e.message }, 500);
  }
});

/**
 * POST /api/rooms/generate — Create missing rooms into EAV
 */
rooms.post('/api/rooms/generate', async (c) => {
  try {
    const buildings = await getBuildingsFromEav();
    let created = 0;

    for (const b of buildings) {
      const floors = await getFloorsFromEav(b.id || b._rowId);
      for (const f of floors) {
        const existing = await getRoomsFromEav(f.id || f._rowId);
        // Default capacity per floor
        const expectedRooms = 4; // Default 4 rooms per floor
        const need = expectedRooms - existing.length;

        for (let i = 0; i < need; i++) {
          const roomNo = `${f.floor}${String(101 + existing.length + i)}`;
          const rowId = crypto.randomUUID();
          const now = new Date().toISOString();

          const roomAttrs: [string, string, string][] = [
            ['building_id', String(b.id || b._rowId), 'string'],
            ['floor_id', String(f.id || f._rowId), 'string'],
            ['floor', f.floor, 'number'],
            ['room_no', roomNo, 'string'],
            ['room_type', '四人间', 'string'],
            ['capacity', '4', 'number'],
            ['status', 'OPEN', 'string'],
            ['disabled', '0', 'number'],
            ['delete_flag', '0', 'number'],
            ['layout_version', '0', 'number'],
            ['created_at', now, 'datetime'],
            ['updated_at', now, 'datetime'],
          ];

          const attrLookup = await db.execute(sql`
            SELECT id, attribute_name FROM t_eav_attribute WHERE entity_id = 8 AND delete_flag = 0
          `);
          const attrMap = new Map((attrLookup as any[]).map((a: any) => [a.attribute_name, a.id]));

          for (const [aname, avalue] of roomAttrs) {
            const aid = attrMap.get(aname);
            if (aid) {
              await db.execute(sql`
                INSERT INTO t_eav_value (entity_id, attribute_id, row_id, field_value)
                VALUES (8, ${aid}, ${rowId}, ${avalue})
              `);
            }
          }
          created++;
        }
      }
    }

    return c.json({ summary: { created, message: created > 0 ? `Created ${created} rooms` : 'All rooms already exist' } }, 201);
  } catch (e: any) {
    return c.json({ error: 'Failed to generate rooms: ' + e.message }, 500);
  }
});

export default rooms;
