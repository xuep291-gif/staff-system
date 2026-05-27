import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';
import { getEavRows } from '../../lib/eav.js';

const config = new Hono();

// API-049: GET /form?id=1 — 全局配置 (matches frontend formHost pattern)
config.get('/form', async (c) => {
  const id = c.req.query('id');
  if (!id) return failCtx(c, '缺少配置ID');

  // Try system_config EAV entity
  try {
    const configs = await getEavRows('system_config');
    const cfg = configs[0] || {};
    return okCtx(c, {
      config: {
        communityId: Number(cfg.community_id || 1),
        orgId: Number(cfg.org_id || 1),
        features: {
          dormSelection: cfg.dorm_selection !== '0',
          payment: cfg.payment !== '0',
          scholarship: cfg.scholarship !== '0',
          loan: cfg.loan !== '0',
        },
      },
    });
  } catch {
    return okCtx(c, {
      config: {
        communityId: 1,
        orgId: 1,
        features: { dormSelection: true, payment: true, scholarship: true, loan: true },
      },
    });
  }
});

// API-050: GET /api/cms/notice/notices — 公告列表
config.get('/api/cms/notice/notices', async (c) => {
  const page = Number(c.req.query('page') || 1);
  const pageSize = Number(c.req.query('pageSize') || 20);
  return okCtx(c, { notices: [] });
});

// API-050 detail: GET /api/cms/notice/notices/:id
config.get('/api/cms/notice/notices/:id', async (c) => {
  const id = c.req.param('id');
  return okCtx(c, { notice: { id: Number(id), title: '', content: '', publishTime: '', type: '通知' } });
});

export default config;
