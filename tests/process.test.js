import { describe, it, expect, vi } from 'vitest';
import { createTestImage, createMockReq, createMockRes } from './helpers.js';

vi.mock('@vercel/blob', () => ({ del: vi.fn().mockResolvedValue(undefined) }));

const { default: handler } = await import('../api/process.js');

describe('POST /api/process', () => {
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

  it('resizes an image', async () => {
    const imageBuffer = await createTestImage(200, 200);
    const req = createMockReq({ width: '100', height: '50', format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(100);
    expect(res._json.height).toBe(50);
    expect(res._json.format).toBe('png');
    expect(res._json.data).toMatch(/^data:image\/png;base64,/);
  });

  it('crops an image', async () => {
    const imageBuffer = await createTestImage(200, 200);
    const crop = { left: 10, top: 10, width: 50, height: 50 };
    const req = createMockReq({ crop: JSON.stringify(crop), format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(50);
    expect(res._json.height).toBe(50);
  });

  it('rejects crop region exceeding image bounds', async () => {
    const imageBuffer = await createTestImage(100, 100);
    const crop = { left: 50, top: 50, width: 80, height: 80 };
    const req = createMockReq({ crop: JSON.stringify(crop), format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
    expect(res._json.error).toBe('Crop region exceeds image bounds');
  });

  it('rejects invalid crop values', async () => {
    const imageBuffer = await createTestImage(100, 100);
    const crop = { left: -1, top: 0, width: 50, height: 50 };
    const req = createMockReq({ crop: JSON.stringify(crop), format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
    expect(res._json.error).toBe('Invalid crop values');
  });

  it('converts to jpeg format', async () => {
    const imageBuffer = await createTestImage(100, 100, { channels: 3 });
    const req = createMockReq({ format: 'jpg', quality: '75' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.format).toBe('jpeg');
    expect(res._json.data).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('converts to webp format', async () => {
    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({ format: 'webp', quality: '80' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.format).toBe('webp');
    expect(res._json.data).toMatch(/^data:image\/webp;base64,/);
  });

  it('rejects invalid width', async () => {
    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({ width: '0', format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(500);
    expect(res._json.error).toContain('Width must be between 1 and 16384');
  });

  it('rejects invalid quality', async () => {
    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({ quality: '200', format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(500);
    expect(res._json.error).toContain('Quality must be between 1 and 100');
  });

  it('strips metadata when requested', async () => {
    const imageBuffer = await createTestImage(100, 100);
    const req = createMockReq({ stripMetadata: 'true', format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(100);
  });

  it('resizes with only width', async () => {
    const imageBuffer = await createTestImage(200, 100);
    const req = createMockReq({ width: '100', format: 'png' }, imageBuffer);
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.width).toBe(100);
  });
});
