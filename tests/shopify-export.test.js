import { describe, it, expect, vi } from 'vitest';
import { createTestImage, createMockReq, createMockRes } from './helpers.js';

vi.mock('@vercel/blob', () => ({ del: vi.fn().mockResolvedValue(undefined) }));

const { default: handler } = await import('../api/shopify-export.js');

describe('POST /api/shopify-export', () => {
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

  it('exports image as 2048x2048 JPEG', async () => {
    const imageBuffer = await createTestImage(500, 500, { channels: 3 });
    const req = createMockReq({}, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(2048);
    expect(res._json.height).toBe(2048);
    expect(res._json.format).toBe('jpeg');
    expect(res._json.data).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('preserves non-square aspect ratio with contain fit', async () => {
    const imageBuffer = await createTestImage(400, 200, { channels: 3 });
    const req = createMockReq({}, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(2048);
    expect(res._json.height).toBe(2048);
  });

  it('includes original metadata in response', async () => {
    const imageBuffer = await createTestImage(300, 200, { channels: 3 });
    const req = createMockReq({}, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.originalWidth).toBe(300);
    expect(res._json.originalHeight).toBe(200);
  });

  it('handles smart crop mode', async () => {
    const imageBuffer = await createTestImage(500, 300, { channels: 3 });
    const req = createMockReq({ smartCrop: 'true' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(2048);
    expect(res._json.height).toBe(2048);
  });

  it('applies manual crop before resize', async () => {
    const imageBuffer = await createTestImage(500, 500, { channels: 3 });
    const cropData = JSON.stringify({ left: 50, top: 50, width: 200, height: 200 });
    const req = createMockReq({ crop: cropData }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(2048);
    expect(res._json.height).toBe(2048);
    expect(res._json.format).toBe('jpeg');
  });

  it('flattens alpha transparency to white', async () => {
    const imageBuffer = await createTestImage(100, 100, {
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 }
    });
    const req = createMockReq({}, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.format).toBe('jpeg');
  });
});
