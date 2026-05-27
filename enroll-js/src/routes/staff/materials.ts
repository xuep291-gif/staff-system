import { Hono } from 'hono';
import { getAuthStaff } from '../../lib/jwt.js';
import { okCtx, failCtx } from '../../lib/response.js';

const materials = new Hono();

// ── Material file templates per bizType ────────────────────────────────────────
// Each bizType maps to a set of realistic file names, MIME types, and plausible sizes.

interface FileTemplate {
  name: string;
  type: string;
  size: number;
}

const FILE_TEMPLATES: Record<string, FileTemplate[]> = {
  scholarship: [
    { name: 'application_form.pdf',    type: 'application/pdf', size: 245760 },
    { name: 'income_certificate.jpg',  type: 'image/jpeg',      size: 153600 },
    { name: 'family_info.pdf',         type: 'application/pdf', size: 198656 },
  ],

  loan: [
    { name: 'loan_application.pdf',   type: 'application/pdf', size: 312320 },
    { name: 'admission_notice.pdf',   type: 'application/pdf', size: 189440 },
    { name: 'family_info.pdf',        type: 'application/pdf', size: 201728 },
    { name: 'income_proof.jpg',       type: 'image/jpeg',      size: 167936 },
  ],

  document_review: [
    { name: 'id_card_front.jpg',       type: 'image/jpeg',      size: 134144 },
    { name: 'id_card_back.jpg',        type: 'image/jpeg',      size: 121856 },
    { name: 'admission_notice.pdf',    type: 'application/pdf', size: 187392 },
    { name: 'household_register.pdf',  type: 'application/pdf', size: 256000 },
    { name: 'photo.jpg',               type: 'image/jpeg',      size: 98304 },
  ],

  non_dorm: [
    { name: 'non_dorm_application.pdf', type: 'application/pdf', size: 225280 },
    { name: 'parental_consent.pdf',     type: 'application/pdf', size: 176128 },
    { name: 'residence_proof.jpg',      type: 'image/jpeg',      size: 142336 },
  ],

  dorm_change: [
    { name: 'room_change_application.pdf', type: 'application/pdf', size: 234496 },
    { name: 'reason_statement.pdf',        type: 'application/pdf', size: 189440 },
  ],

  dorm_withdraw: [
    { name: 'dorm_withdraw_application.pdf', type: 'application/pdf', size: 215040 },
    { name: 'parental_consent.pdf',          type: 'application/pdf', size: 176128 },
  ],

  green_channel: [
    { name: 'green_channel_application.pdf',  type: 'application/pdf', size: 220160 },
    { name: 'supporting_documents.pdf',       type: 'application/pdf', size: 312320 },
  ],

  fee_exemption: [
    { name: 'exemption_application.pdf', type: 'application/pdf', size: 198656 },
    { name: 'income_certificate.jpg',    type: 'image/jpeg',      size: 153600 },
    { name: 'approval_letter.pdf',       type: 'application/pdf', size: 167936 },
  ],
};

// Default template when bizType is unknown
const DEFAULT_TEMPLATES: FileTemplate[] = [
  { name: 'file_1.pdf', type: 'application/pdf', size: 102400 },
  { name: 'file_2.jpg', type: 'image/jpeg',      size: 81920 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function generateFileId(bizType: string, bizId: string, index: number): string {
  return `FILE_${bizType}_${bizId}_${index}_${Math.random().toString(36).slice(2, 6)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /materials/:bizType/:bizId — list files attached to a business entity
materials.get('/materials/:bizType/:bizId', async (c) => {
  const auth = getAuthStaff(c);
  if (!auth) return failCtx(c, '未登录', 40100, 401);

  const bizType = c.req.param('bizType');
  const bizId   = c.req.param('bizId');
  const includePreviewUrl = c.req.query('includePreviewUrl') === 'true';

  if (!bizType || !bizId) {
    return failCtx(c, '业务类型和业务ID不能为空', 40001);
  }

  const templates = FILE_TEMPLATES[bizType] || DEFAULT_TEMPLATES;

  const files = templates.map((tpl, index) => {
    const fileId = generateFileId(bizType, bizId, index);
    const file: Record<string, unknown> = {
      fileId,
      fileName:   tpl.name,
      fileType:   tpl.type,
      size:       tpl.size,
      downloadUrl: `/api/v1/files/${fileId}/download`,
      uploadedAt: new Date(
        Date.now() - Math.floor(Math.random() * 30 * 24 * 3600 * 1000),
      ).toISOString(),
    };
    if (includePreviewUrl) {
      file.previewUrl = `/api/v1/files/${fileId}/preview`;
    }
    return file;
  });

  return okCtx(c, { bizType, bizId, files });
});

export default materials;
