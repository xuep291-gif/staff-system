import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

export interface EavRow {
  _rowId: string;
  [key: string]: string | null;
}

export async function getEavRows(entityName: string): Promise<EavRow[]> {
  const values = await db.execute(sql`
    SELECT v.row_id, a.attribute_name, v.field_value
    FROM t_eav_value v
    JOIN t_eav_attribute a ON a.id = v.attribute_id
    JOIN t_eav_entity e ON e.id = v.entity_id
    WHERE e.entity_name = ${entityName} AND COALESCE(v.delete_flag, 0) = 0
    ORDER BY v.row_id, a.id
  `);

  const map = new Map<string, EavRow>();
  for (const r of values as any[]) {
    if (!map.has(r.row_id)) map.set(r.row_id, { _rowId: r.row_id });
    map.get(r.row_id)![r.attribute_name] = r.field_value;
  }
  return [...map.values()];
}

export async function getEavRow(entityName: string, rowId: string): Promise<EavRow | null> {
  const values = await db.execute(sql`
    SELECT v.row_id, a.attribute_name, v.field_value
    FROM t_eav_value v
    JOIN t_eav_attribute a ON a.id = v.attribute_id
    JOIN t_eav_entity e ON e.id = v.entity_id
    WHERE e.entity_name = ${entityName} AND v.row_id = ${rowId} AND COALESCE(v.delete_flag, 0) = 0
    ORDER BY a.id
  `);

  if ((values as any[]).length === 0) return null;
  const row: EavRow = { _rowId: rowId };
  for (const r of values as any[]) {
    row[r.attribute_name] = r.field_value;
  }
  return row;
}

export async function getEavRowsByField(entityName: string, field: string, value: string): Promise<EavRow[]> {
  const entity = await db.execute(sql`
    SELECT e.id, a.id as attr_id
    FROM t_eav_entity e
    JOIN t_eav_attribute a ON a.entity_id = e.id
    WHERE e.entity_name = ${entityName} AND a.attribute_name = ${field}
    LIMIT 1
  `);
  if ((entity as any[]).length === 0) return [];

  const rowIds = await db.execute(sql`
    SELECT row_id FROM t_eav_value
    WHERE entity_id = ${(entity as any[])[0].id}
      AND attribute_id = ${(entity as any[])[0].attr_id}
      AND field_value = ${value}
      AND COALESCE(delete_flag, 0) = 0
  `);

  const result: EavRow[] = [];
  for (const r of rowIds as any[]) {
    const row = await getEavRow(entityName, r.row_id);
    if (row) result.push(row);
  }
  return result;
}

export function eavNum(row: EavRow, attr: string): number | null {
  const v = row[attr];
  if (v === null || v === undefined) return null;
  return Number(v);
}

export function eavBool(row: EavRow, attr: string): boolean {
  const v = row[attr];
  return v === '1' || v === 'true';
}
