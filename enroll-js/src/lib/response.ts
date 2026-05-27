import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

function envelope<T>(code: number, message: string, data: T) {
  return {
    code,
    message,
    data,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  };
}

export function ok(data: unknown, message = 'success') {
  return envelope(0, message, data);
}

export function fail(message: string, code = 1, status = 200) {
  return envelope(code, message, null);
}

export function okCtx(c: Context, data: unknown, message = 'success', httpStatus: ContentfulStatusCode = 200) {
  c.status(httpStatus);
  return c.json(envelope(0, message, data));
}

export function failCtx(c: Context, message: string, code = 1, httpStatus: ContentfulStatusCode = 200) {
  c.status(httpStatus);
  return c.json(envelope(code, message, null));
}
