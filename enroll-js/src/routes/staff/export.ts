import { Hono } from 'hono';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const exportRoutes = new Hono();

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
interface ExportTask {
  taskId: string;
  exportType: string;
  fileFormat: string;
  filters: Record<string, unknown>;
  columns: string[];
  status: 'pending' | 'running' | 'finished' | 'failed';
  progress: number;
  fileId: string | null;
  downloadUrl: string | null;
  failureReason: string | null;
  fileName: string | null;
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
}

const exportStore: ExportTask[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// 1. POST /export/tasks — Create export task
// ---------------------------------------------------------------------------
exportRoutes.post('/export/tasks', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { exportType, fileFormat, filters, columns } = await c.req.json().catch(() => ({}));

  if (!exportType) return failCtx(c, 'exportType不能为空', 40001);
  if (!filters) return failCtx(c, 'filters不能为空', 40001);

  const fmt = fileFormat || 'xlsx';

  const now = new Date().toISOString();
  const taskId = genId('EXP');

  const task: ExportTask = {
    taskId,
    exportType,
    fileFormat: fmt,
    filters,
    columns: columns || [],
    status: 'pending',
    progress: 0,
    fileId: null,
    downloadUrl: null,
    failureReason: null,
    fileName: null,
    expiresAt: null,
    createdAt: now,
    createdBy: auth.userId,
  };
  exportStore.push(task);

  // Auto-transition to 'finished' after a short delay for demo
  setTimeout(() => {
    const t = exportStore.find((e) => e.taskId === taskId);
    if (t) {
      t.status = 'running';
      t.progress = 50;

      setTimeout(() => {
        const t2 = exportStore.find((e) => e.taskId === taskId);
        if (t2) {
          const fileId = genId('file');
          const fileName = `${exportType}_${new Date().toISOString().slice(0, 10)}.${fmt}`;
          t2.status = 'finished';
          t2.progress = 100;
          t2.fileId = fileId;
          t2.fileName = fileName;
          t2.downloadUrl = `https://example.com/export/${fileId}/${encodeURIComponent(fileName)}`;
          t2.expiresAt = new Date(Date.now() + 86400000 * 7).toISOString(); // 7 days
        }
      }, 1500);
    }
  }, 500);

  return okCtx(c, { taskId, status: 'pending', createdAt: now });
});

// ---------------------------------------------------------------------------
// 2. GET /export/tasks/:taskId — Query export task
// ---------------------------------------------------------------------------
exportRoutes.get('/export/tasks/:taskId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const taskId = c.req.param('taskId');
  const task = exportStore.find((t) => t.taskId === taskId);
  if (!task) return failCtx(c, '导出任务不存在', 40401);

  return okCtx(c, {
    taskId: task.taskId,
    exportType: task.exportType,
    status: task.status,
    progress: task.progress,
    fileId: task.fileId,
    downloadUrl: task.downloadUrl,
    failureReason: task.failureReason,
    expiresAt: task.expiresAt,
  });
});

// ---------------------------------------------------------------------------
// 3. GET /export/tasks/:taskId/download — Download export file
// ---------------------------------------------------------------------------
exportRoutes.get('/export/tasks/:taskId/download', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const taskId = c.req.param('taskId');
  const task = exportStore.find((t) => t.taskId === taskId);
  if (!task) return failCtx(c, '导出任务不存在', 40401);
  if (task.status !== 'finished') return failCtx(c, `任务尚未完成，当前状态: ${task.status}`, 40001);
  if (!task.downloadUrl) return failCtx(c, '下载链接不存在', 40401);

  return okCtx(c, {
    downloadUrl: task.downloadUrl,
    fileName: task.fileName,
    expiresAt: task.expiresAt,
  });
});

export default exportRoutes;
