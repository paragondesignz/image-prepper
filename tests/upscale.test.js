import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestImage, createMockReq, createMockRes } from './helpers.js';

vi.mock('@vercel/blob', () => ({ del: vi.fn().mockResolvedValue(undefined) }));

const { default: handler } = await import('../api/upscale.js');

describe('POST /api/upscale', () => {
  const originalEnv = { ...process.env };
  let originalFetch;

  beforeEach(() => {
    process.env.RECRAFT_API_KEY = 'test-key-123';
    originalFetch = global.fetch;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  it('rejects non-POST methods', async () => {
    const req = { method: 'GET' };
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
    expect(res._json.error).toBe('Method not allowed');
  });

  it('returns 500 when no file in multipart body', async () => {
    const req = createMockReq({});
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(500);
    expect(res._json.error).toContain('Unexpected end of form');
  });

  it('returns 400 when API key is placeholder', async () => {
    process.env.RECRAFT_API_KEY = 'your_api_key_here';
    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({}, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
    expect(res._json.error).toBe('RECRAFT_API_KEY not configured');
  });

  it('returns 400 when API key is missing', async () => {
    delete process.env.RECRAFT_API_KEY;
    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({}, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
    expect(res._json.error).toBe('RECRAFT_API_KEY not configured');
  });

  it('calls crisp upscale endpoint by default', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ url: 'https://example.com/upscaled.png' }] })
    });

    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({}, imageBuffer);
    const res = createMockRes();
    await handler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://external.api.recraft.ai/v1/images/crispUpscale',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Authorization': 'Bearer test-key-123' }
      })
    );
    expect(res._status).toBe(200);
  });

  it('calls creative upscale endpoint when type is creative', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ url: 'https://example.com/upscaled.png' }] })
    });

    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({ type: 'creative' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://external.api.recraft.ai/v1/images/creativeUpscale',
      expect.anything()
    );
    expect(res._status).toBe(200);
  });

  it('handles API error responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limit exceeded')
    });

    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({}, imageBuffer);
    const res = createMockRes();
    await handler(req, res);

    expect(res._status).toBe(429);
    expect(res._json.error).toContain('Recraft API error');
    expect(res._json.error).toContain('Rate limit exceeded');
  });
});
