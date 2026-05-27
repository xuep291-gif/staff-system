import { Hono } from 'hono';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const files = new Hono();

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
interface FileRecord {
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  previewUrl: string | null;
  bizType: string;
  bizId: string | null;
  fileType: string | null;
  uploadedBy: string;
  uploadedAt: string;
  // Simulated data stored as base64 or path
  data: string;
}

interface PackageTask {
  taskId: string;
  bizType: string;
  bizId: string;
  fileIds: string[];
  status: 'processing' | 'finished' | 'failed';
  fileId: string | null;
  downloadUrl: string | null;
  createdAt: string;
}

const fileStore: FileRecord[] = [];
const packageStore: PackageTask[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function detectMimeType(fileName: string, mimeType?: string): string {
  if (mimeType) return mimeType;
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    txt: 'text/plain',
    json: 'application/json',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
  };
  return map[ext] || 'application/octet-stream';
}

function isImage(mime: string): boolean {
  return mime.startsWith('image/');
}

// Seed store
if (fileStore.length === 0) {
  const now = Date.now();
  fileStore.push({
    fileId: 'file_' + (now - 86400000) + '_seed01',
    fileName: '学费缴费凭证.pdf',
    mimeType: 'application/pdf',
    size: 245760,
    url: 'https://example.com/files/seed01.pdf',
    previewUrl: null,
    bizType: 'payment',
    bizId: 'BILL_2024001',
    fileType: 'payment_voucher',
    uploadedBy: 'staff_001',
    uploadedAt: new Date(now - 86400000).toISOString(),
    data: 'base64-mock-pdf-data',
  });
  fileStore.push({
    fileId: 'file_' + (now - 43200000) + '_seed02',
    fileName: '身份证正面.png',
    mimeType: 'image/png',
    size: 102400,
    url: 'https://example.com/files/seed02.png',
    previewUrl: 'https://example.com/preview/seed02.png',
    bizType: 'document',
    bizId: 'STU_2024001',
    fileType: 'id_card',
    uploadedBy: 'staff_001',
    uploadedAt: new Date(now - 43200000).toISOString(),
    data: 'base64-mock-png-data',
  });
}

// Seed packages
if (packageStore.length === 0) {
  const now = Date.now();
  packageStore.push({
    taskId: 'PKG_' + (now - 3600000) + '_seed01',
    bizType: 'document',
    bizId: 'STU_2024001',
    fileIds: ['file_001', 'file_002'],
    status: 'finished',
    fileId: 'file_pkg_001',
    downloadUrl: 'https://example.com/packages/pkg_001.zip',
    createdAt: new Date(now - 3600000).toISOString(),
  });
}

// ---------------------------------------------------------------------------
// 1. POST /files/upload — Upload file
// ---------------------------------------------------------------------------
files.post('/files/upload', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  let fileName = '';
  let mimeType = '';
  let data = '';
  let size = 0;
  let bizType = '';
  let bizId: string | null = null;
  let fileType: string | null = null;

  // Support both multipart/form-data and JSON body
  const contentType = c.req.header('Content-Type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await c.req.formData();
    const file = form.get('file');
    bizType = (form.get('bizType') as string) || '';
    bizId = (form.get('bizId') as string) || null;
    fileType = (form.get('fileType') as string) || null;

    if (!bizType) return failCtx(c, 'bizType不能为空', 40001);
    if (!file) return failCtx(c, '文件不能为空', 40001);

    if (file instanceof File) {
      fileName = file.name;
      mimeType = file.type || detectMimeType(fileName);
      const buf = await file.arrayBuffer();
      data = Buffer.from(buf).toString('base64');
      size = buf.byteLength;
    } else {
      return failCtx(c, '不支持的文件类型', 40001);
    }
  } else {
    // JSON body with base64
    const body = await c.req.json().catch(() => ({}));
    bizType = body.bizType;
    bizId = body.bizId || null;
    fileType = body.fileType || null;
    fileName = body.fileName || 'untitled';
    mimeType = detectMimeType(fileName, body.mimeType);
    data = body.base64 || body.data || '';
    size = Math.ceil(data.length * 0.75); // rough estimate of base64 decoded size

    if (!bizType) return failCtx(c, 'bizType不能为空', 40001);
    if (!data) return failCtx(c, '文件数据不能为空', 40001);
  }

  const now = new Date().toISOString();
  const fileId = genId('file');

  const record: FileRecord = {
    fileId,
    fileName,
    mimeType,
    size,
    url: `https://example.com/files/${fileId}/${encodeURIComponent(fileName)}`,
    previewUrl: isImage(mimeType) ? `https://example.com/preview/${fileId}/${encodeURIComponent(fileName)}` : null,
    bizType,
    bizId,
    fileType,
    uploadedBy: auth.userId,
    uploadedAt: now,
    data,
  };
  fileStore.push(record);

  return okCtx(c, {
    fileId,
    fileName,
    mimeType,
    size,
    url: record.url,
    previewUrl: record.previewUrl,
    uploadedAt: now,
  });
});

// ---------------------------------------------------------------------------
// 2. GET /files/:fileId/preview — Preview file
// ---------------------------------------------------------------------------
files.get('/files/:fileId/preview', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const fileId = c.req.param('fileId');
  const disposition = c.req.query('disposition') || 'inline';
  const expiresIn = Number(c.req.query('expiresIn')) || 3600;

  const record = fileStore.find((f) => f.fileId === fileId);
  if (!record) return failCtx(c, '文件不存在', 40401);

  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const previewUrl = record.previewUrl
    ? `${record.previewUrl}?disposition=${disposition}&expires=${expiresIn}`
    : record.url + `?disposition=${disposition}&expires=${expiresIn}`;

  return okCtx(c, { previewUrl, expiresAt });
});

// ---------------------------------------------------------------------------
// 3. GET /files/:fileId/download — Download file
// ---------------------------------------------------------------------------
files.get('/files/:fileId/download', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const fileId = c.req.param('fileId');
  const disposition = c.req.query('disposition') || 'attachment';

  const record = fileStore.find((f) => f.fileId === fileId);
  if (!record) return failCtx(c, '文件不存在', 40401);

  const expiresIn = 3600; // 1 hour default for download
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const downloadUrl = `${record.url}?disposition=${disposition}&expires=${expiresIn}`;

  return okCtx(c, { downloadUrl, fileName: record.fileName, expiresAt });
});

// ---------------------------------------------------------------------------
// 4. POST /files/package — Download material package
// ---------------------------------------------------------------------------
files.post('/files/package', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const { bizType, bizId, fileIds } = await c.req.json().catch(() => ({}));
  if (!bizType) return failCtx(c, 'bizType不能为空', 40001);
  if (!bizId) return failCtx(c, 'bizId不能为空', 40001);

  const now = new Date().toISOString();
  const taskId = genId('PKG');

  // Collect files to package
  const targetIds = fileIds && fileIds.length > 0
    ? fileIds
    : fileStore.filter((f) => f.bizType === bizType && f.bizId === bizId).map((f) => f.fileId);

  const task: PackageTask = {
    taskId,
    bizType,
    bizId,
    fileIds: targetIds,
    status: 'processing',
    fileId: null,
    downloadUrl: null,
    createdAt: now,
  };
  packageStore.push(task);

  // Simulate async packaging — mark finished after a short delay for demo
  // For demo we immediately mark finished
  setTimeout(() => {
    const t = packageStore.find((p) => p.taskId === taskId);
    if (t) {
      const pkgFileId = genId('file');
      t.status = 'finished';
      t.fileId = pkgFileId;
      t.downloadUrl = `https://example.com/packages/${pkgFileId}/${bizType}_${bizId}.zip`;
    }
  }, 100);

  // Return immediately with processing status
  return okCtx(c, { taskId, status: 'processing', fileId: null, downloadUrl: null });
});

export default files;
