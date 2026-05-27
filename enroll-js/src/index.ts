import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import health from './routes/health.js';
import entities from './routes/entities.js';
import rooms from './routes/rooms.js';
import teachers from './routes/teachers.js';
import student from './routes/student/index.js';
import staff from './routes/staff/index.js';

const app = new Hono();

app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-App-Id', 'X-Client-Type', 'X-Role'],
  }),
);

// Mount routes
app.route('/', health);
app.route('/', entities);
app.route('/', rooms);
app.route('/', teachers);
app.route('/', student);
app.route('/api/v1', staff);

const port = Number(process.env.PORT) || 3100;

console.log(`Server starting on port ${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  },
);
