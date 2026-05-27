import {
  pgTable,
  bigserial,
  varchar,
  text,
  bigint,
  smallint,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// t_eav_entity — main entity definition table
export const tEavEntity = pgTable('t_eav_entity', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  entityName: varchar('entity_name', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  tableName: varchar('table_name', { length: 100 }),
  description: text('description'),
  orgId: bigint('org_id', { mode: 'number' }).notNull(),
  appid: varchar('appid', { length: 26 }),
  deleteFlag: smallint('delete_flag').default(0),
  searchFields: jsonb('search_fields'),
  resourceIdentifier: varchar('resource_identifier', { length: 255 }),
  storageMode: varchar('storage_mode', { length: 10 }),
  statusCounts: jsonb('status_counts'),
  orderBy: text('order_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('t_eav_entity_entity_name_org_id_appid_key')
    .on(table.entityName, table.orgId, table.appid),
]);
