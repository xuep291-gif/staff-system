import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';
import { getEavRows, eavNum } from '../../lib/eav.js';

const dorm = new Hono();

// Helper: get building info from EAV
function mapBuilding(r: any) {
  return {
    id: Number(r.id),
    name: r.name,
    type: r.gender_limit === '1' ? '男生宿舍' : r.gender_limit === '2' ? '女生宿舍' : '男女不限',
    remain: Number(r.total_rooms || 0),
    price: 0,
    gender: r.gender_limit === '1' ? '男' : r.gender_limit === '2' ? '女' : '',
    floors: Number(r.floors || 0),
    color: '#4A90D9',
  };
}

// API-012: GET /api/student/dorm/buildings — 楼栋列表
dorm.get('/api/student/dorm/buildings', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const gender = c.req.query('gender');
  const buildings = await getEavRows('building_info');
  let mapped = buildings.map(mapBuilding);
  if (gender) mapped = mapped.filter(b => b.gender === gender || !b.gender);
  return okCtx(c, { buildings: mapped });
});

// API-013: GET /api/student/dorm/floors — 楼层列表
dorm.get('/api/student/dorm/floors', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const buildingId = c.req.query('buildingId');
  if (!buildingId) return failCtx(c, '缺少楼栋ID');

  const floors = await getEavRows('building_floor');
  const filtered = floors.filter(f => f.building_id === buildingId && f.disabled === '0');
  const mapped = filtered.map(f => ({
    id: Number(f.id),
    name: `${f.floor}层`,
    remain: Number(f.total_rooms || 0),
  }));
  return okCtx(c, { floors: mapped });
});

// API-014: GET /api/student/dorm/rooms — 房间列表
dorm.get('/api/student/dorm/rooms', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const floorId = c.req.query('floorId');
  if (!floorId) return failCtx(c, '缺少楼层ID');

  const rooms = await getEavRows('building_room');
  const filtered = rooms.filter(r => r.floor_id === floorId && r.disabled === '0');
  const mapped = filtered.map(r => ({
    id: Number(r.id),
    name: r.room_no,
    remain: Number(r.capacity || 4),
    type: r.room_type || '四人间',
    bedCount: Number(r.capacity || 4),
  }));
  return okCtx(c, { rooms: mapped });
});

// API-015: GET /api/student/dorm/beds — 床位列表
dorm.get('/api/student/dorm/beds', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const roomId = c.req.query('roomId');
  if (!roomId) return failCtx(c, '缺少房间ID');

  const beds = await getEavRows('building_room_bed');
  const filtered = beds.filter(b => b.room_id === roomId && b.disabled === '0');
  const mapped = filtered.map(b => ({
    id: Number(b.id),
    name: `${b.bed_no}号床`,
    status: b.status === 'OPEN' ? 'available' : 'occupied',
    occupant: null,
  }));
  return okCtx(c, { beds: mapped });
});

// API-016: POST /api/student/dorm/select — 确认选宿
dorm.post('/api/student/dorm/select', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { buildingId, floorId, roomId, bedId } = await c.req.json().catch(() => ({}));
  if (!buildingId || !floorId || !roomId || !bedId) return failCtx(c, '参数不完整');

  // Update bed status
  await db.execute(sql`
    UPDATE t_eav_value SET field_value = 'OCCUPIED'
    WHERE entity_id = 9 AND row_id = (
      SELECT v.row_id FROM t_eav_value v
      JOIN t_eav_attribute a ON a.id = v.attribute_id AND a.attribute_name = 'id'
      WHERE v.entity_id = 9 AND v.field_value = ${String(bedId)} LIMIT 1
    )
    AND attribute_id IN (SELECT id FROM t_eav_attribute WHERE entity_id = 9 AND attribute_name = 'status')
  `);

  const now = new Date().toISOString();
  return okCtx(c, {
    dormInfo: {
      building: `Building ${buildingId}`,
      floor: `Floor ${floorId}`,
      room: `Room ${roomId}`,
      bed: `Bed ${bedId}`,
      type: '四人间',
      price: 1200,
      selectTime: now,
    },
  }, '选宿成功');
});

// API-017: POST /api/student/dorm/no-dorm — 放弃选宿
dorm.post('/api/student/dorm/no-dorm', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  return okCtx(c, null, '已确认放弃选宿');
});

// API-018: GET /api/student/dorm/info — 宿舍信息
dorm.get('/api/student/dorm/info', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const dormInfo = {
    building: null, floor: null, room: null, bed: null,
    type: null, price: null, gender: null, selectTime: null,
  };

  return okCtx(c, { dormInfo, roommates: [], changeHistory: [] });
});

// API-019: POST /api/student/dorm/change-apply — 换宿申请
dorm.post('/api/student/dorm/change-apply', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const { reason } = await c.req.json().catch(() => ({}));
  if (!reason || !String(reason).trim()) return failCtx(c, '换宿原因不能为空');
  if (String(reason).trim().length > 200) return failCtx(c, '原因不超过200字');

  return okCtx(c, null, '换宿申请已提交');
});

export default dorm;
