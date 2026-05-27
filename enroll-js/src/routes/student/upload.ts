import { Hono } from 'hono';
import { getAuthStudent } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const upload = new Hono();

// API-048: POST /api/student/upload — 通用文件上传
upload.post('/api/student/upload', async (c) => {
  const auth = getAuthStudent(c);
  if (!auth) return failCtx(c, '未登录', 2, 401);

  const type = c.req.query('type') || 'document';
  const body = await c.req.parseBody().catch(() => ({}));
  const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return okCtx(c, {
    fileId,
    url: `/uploads/${fileId}`,
    fileName: `upload_${type}_${fileId}.jpg`,
  }, '上传成功');
});

export default upload;
