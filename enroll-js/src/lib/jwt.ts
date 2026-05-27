import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'enroll-js-secret';

export function sign(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verify(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const sig = crypto.createHmac('sha256', SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url');
    if (sig !== parts[2]) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch {
    return null;
  }
}

export function getToken(c: { req: { header: (name: string) => string | undefined } }): string | null {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export function getAuthStudent(c: { req: { header: (name: string) => string | undefined } }): { sid: string; name: string } | null {
  const token = getToken(c);
  if (!token) return null;
  const payload = verify(token);
  if (!payload) return null;
  return { sid: payload.sid as string, name: payload.name as string };
}

export interface StaffAuth {
  userId: string;
  name: string;
  workNo: string;
  role: string;
  roles: string[];
  orgId: string;
  departmentId: string;
}

export function getAuthStaff(c: { req: { header: (name: string) => string | undefined } }): StaffAuth | null {
  const token = getToken(c);
  if (!token) return null;
  const payload = verify(token);
  if (!payload) return null;
  if (!payload.role) return null;
  return {
    userId: payload.userId as string,
    name: payload.name as string,
    workNo: payload.workNo as string,
    role: payload.role as string,
    roles: (payload.roles as string[]) || [payload.role as string],
    orgId: payload.orgId as string,
    departmentId: payload.departmentId as string,
  };
}

export function requireStaff(c: { req: { header: (name: string) => string | undefined } }): StaffAuth | null {
  return getAuthStaff(c);
}

export function requireRole(...roles: string[]) {
  return (c: { req: { header: (name: string) => string | undefined } }): StaffAuth | null => {
    const auth = getAuthStaff(c);
    if (!auth) return null;
    if (roles.length > 0 && !roles.some(r => auth.roles.includes(r))) return null;
    return auth;
  };
}
