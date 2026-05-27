import { Hono } from 'hono';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

const health = new Hono();

health.get('/health', async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return c.json(
      { status: 'degraded', database: 'disconnected', error: String(error) },
      503,
    );
  }
});

export default health;
