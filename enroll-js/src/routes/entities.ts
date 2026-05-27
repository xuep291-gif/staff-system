import { Hono } from 'hono';
import { db } from '../db/index.js';
import { tEavEntity } from '../schema/index.js';
import { eq } from 'drizzle-orm';

const entities = new Hono();

// List EAV entities
entities.get('/api/entities', async (c) => {
  const result = await db
    .select({
      id: tEavEntity.id,
      entityName: tEavEntity.entityName,
      entityType: tEavEntity.entityType,
      tableName: tEavEntity.tableName,
      orgId: tEavEntity.orgId,
    })
    .from(tEavEntity)
    .where(eq(tEavEntity.deleteFlag, 0))
    .limit(100);
  return c.json(result);
});

// Get single EAV entity by ID
entities.get('/api/entities/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const result = await db
    .select()
    .from(tEavEntity)
    .where(eq(tEavEntity.id, id))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: 'Entity not found' }, 404);
  }
  return c.json(result[0]);
});

export default entities;
