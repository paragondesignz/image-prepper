import sharp from 'sharp';
import FormData from 'form-data';
import { PassThrough } from 'stream';

/**
 * Create a small test image buffer
 */
export async function createTestImage(width = 100, height = 100, options = {}) {
  const { channels = 4, format = 'png', background = { r: 255, g: 0, b: 0, alpha: 1 } } = options;
  let pipeline = sharp({
    create: {
      width,
      height,
      channels,
      background
    }
  });

  if (format === 'png') {
    pipeline = pipeline.png();
  } else if (format === 'jpeg' || format === 'jpg') {
    pipeline = pipeline.jpeg();
  } else if (format === 'webp') {
    pipeline = pipeline.webp();
  }

  return pipeline.toBuffer();
}

/**
 * Create a mock request from form data fields and optional file buffer
 */
export function createMockReq(fields = {}, fileBuffer = null, filename = 'test.png', mimeType = 'image/png') {
  const form = new FormData();

  if (fileBuffer) {
    form.append('file', fileBuffer, { filename, contentType: mimeType });
  }

  for (const [key, value] of Object.entries(fields)) {
    form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  }

  const passthrough = new PassThrough();
  form.pipe(passthrough);

  passthrough.headers = form.getHeaders();
  passthrough.method = 'POST';

  return passthrough;
}

/**
 * Create a mock response object that captures status and json output
 */
export function createMockRes() {
  const res = {
    _status: null,
    _json: null,
    status(code) {
      res._status = code;
      return res;
    },
    json(data) {
      res._json = data;
      return res;
    }
  };
  return res;
}
