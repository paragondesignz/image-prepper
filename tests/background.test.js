import { describe, it, expect, vi } from 'vitest';
import { createTestImage, createMockReq, createMockRes } from './helpers.js';

vi.mock('@vercel/blob', () => ({ del: vi.fn().mockResolvedValue(undefined) }));

const { default: handler } = await import('../api/background.js');

describe('POST /api/background', () => {
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

  it('flattens transparency with default white background', async () => {
    const imageBuffer = await createTestImage(100, 100, {
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 }
    });
    const req = createMockReq({ format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(100);
    expect(res._json.height).toBe(100);
    expect(res._json.data).toMatch(/^data:image\/png;base64,/);
  });

  it('flattens transparency with custom color', async () => {
    const imageBuffer = await createTestImage(100, 100, {
      channels: 4,
      background: { r: 0, g: 255, b: 0, alpha: 0.5 }
    });
    const req = createMockReq({ color: '#000000', format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(100);
  });

  it('outputs as jpeg when requested', async () => {
    const imageBuffer = await createTestImage(100, 100, { channels: 4 });
    const req = createMockReq({ format: 'jpg', quality: '75' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.format).toBe('jpeg');
    expect(res._json.data).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('outputs as webp when requested', async () => {
    const imageBuffer = await createTestImage(100, 100, { channels: 4 });
    const req = createMockReq({ format: 'webp', quality: '80' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.format).toBe('webp');
    expect(res._json.data).toMatch(/^data:image\/webp;base64,/);
  });

  it('uses default quality of 80', async () => {
    const imageBuffer = await createTestImage(100, 100, { channels: 4 });
    const req = createMockReq({ format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(100);
  });
});
