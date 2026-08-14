import type { APIContext } from 'astro';
import { auth } from '@wix/essentials';
import { z } from 'zod';

const securityHeaders = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'self' https://*.wix.com https://*.wixsite.com",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
} as const;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200, requestId = crypto.randomUUID()): Response {
  return new Response(JSON.stringify({ data, requestId }), {
    status,
    headers: { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'X-Request-Id': requestId },
  });
}

export function jsonError(error: unknown, requestId = crypto.randomUUID()): Response {
  if (error instanceof ApiError) {
    return new Response(JSON.stringify({ error: { code: error.code, message: error.message }, requestId }), {
      status: error.status,
      headers: { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'X-Request-Id': requestId },
    });
  }
  if (error instanceof z.ZodError) {
    return new Response(
      JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Request validation failed', issues: error.issues }, requestId }),
      { status: 400, headers: { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'X-Request-Id': requestId } },
    );
  }

  console.error('Unhandled API error', { requestId, error });
  return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed' }, requestId }), {
    status: 500,
    headers: { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'X-Request-Id': requestId },
  });
}

export async function parseJson<T extends z.ZodType>(context: APIContext, schema: T): Promise<z.infer<T>> {
  const contentType = context.request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json');
  }
  const length = Number(context.request.headers.get('content-length') ?? 0);
  if (Number.isFinite(length) && length > 32_768) throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  let input: unknown;
  try {
    const raw = await context.request.text();
    if (new TextEncoder().encode(raw).byteLength > 32_768) {
      throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
    }
    input = JSON.parse(raw);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, 'INVALID_JSON', 'Request body must contain valid JSON');
  }
  return schema.parse(input);
}

export function assertSameOrigin(context: APIContext): void {
  const origin = context.request.headers.get('origin');
  if (!origin) return;
  if (origin !== context.url.origin) throw new ApiError(403, 'ORIGIN_REJECTED', 'Request origin is not allowed');
}

export async function requireWixRequest(): Promise<void> {
  try {
    await auth.getTokenInfo();
  } catch {
    throw new ApiError(401, 'WIX_AUTH_REQUIRED', 'A valid Wix visitor token is required');
  }
}

export function clientAddress(context: APIContext): string {
  return (
    context.request.headers.get('cf-connecting-ip') ??
    context.request.headers.get('x-wix-client-ip') ??
    context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}
