import {
  pgTable,
  bigserial,
  varchar,
  text,
  bigint,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tEavEntity } from './entity.js';
import { tEavAttribute } from './attribute.js';

// t_eav_value — EAV data storage (key-value)
export const tEavValue = pgTable('t_eav_value', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  entityId: bigint('entity_id', { mode: 'number' }).notNull(),
  attributeId: bigint('attribute_id', { mode: 'number' }).notNull(),
  rowId: varchar('row_id', { length: 36 }).notNull(),
  fieldValue: text('field_value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const tEavValueRelations = relations(tEavValue, ({ one }) => ({
  entity: one(tEavEntity, {
    fields: [tEavValue.entityId],
    references: [tEavEntity.id],
    relationName: 'entity_values',
  }),
  attribute: one(tEavAttribute, {
    fields: [tEavValue.attributeId],
    references: [tEavAttribute.id],
    relationName: 'attribute_values',
  }),
}));
