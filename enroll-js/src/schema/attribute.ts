import {
  pgTable,
  bigserial,
  varchar,
  text,
  bigint,
  integer,
  smallint,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tEavEntity } from './entity.js';

// t_eav_attribute — entity attribute/field definitions
export const tEavAttribute = pgTable('t_eav_attribute', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  attributeName: varchar('attribute_name', { length: 100 }).notNull(),
  entityId: bigint('entity_id', { mode: 'number' }).notNull(),
  fieldType: varchar('field_type', { length: 50 }).notNull(),
  fieldName: varchar('field_name', { length: 100 }),
  defaultValue: text('default_value'),
  sortOrder: integer('sort_order').default(0),
  deleteFlag: smallint('delete_flag').default(0),
  queryOnly: smallint('query_only').default(0),
  joinEntity: varchar('join_entity', { length: 100 }),
  joinAttribute: varchar('join_attribute', { length: 100 }),
  joinOn: varchar('join_on', { length: 100 }),
  joinWith: varchar('join_with', { length: 100 }).default('row_id'),
  notNull: smallint('not_null').default(0),
  unique: smallint('unique').default(0),
  autoIncrement: smallint('auto_increment').default(0),
  comment: text('comment'),
  nativeField: varchar('native_field', { length: 50 }).notNull().default('VARCHAR(255)'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('t_eav_attribute_attribute_name_entity_id_key')
    .on(table.attributeName, table.entityId),
]);

export const tEavAttributeRelations = relations(tEavAttribute, ({ one }) => ({
  entity: one(tEavEntity, {
    fields: [tEavAttribute.entityId],
    references: [tEavEntity.id],
    relationName: 'entity_attributes',
  }),
}));
