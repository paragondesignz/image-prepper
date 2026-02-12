const sharp = require('sharp');
const { parseMultipart, getImageBuffer, cleanupBlob } = require('./_utils');

async function crispUpscale(fileBuffer, mimeType, filename) {
  const apiKey = process.env.RECRAFT_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('RECRAFT_API_KEY not configured — cannot auto-upscale');
  }

  const blob = new Blob([fileBuffer], { type: mimeType || 'image/png' });
  const form = new FormData();
  form.append('file', blob, filename || 'image.png');

  const response = await fetch('https://external.api.recraft.ai/v1/images/crispUpscale', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: form
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Recraft upscale failed: ${errText}`);
  }

  const result = await response.json();
  const imageUrl = result.image && result.image.url;
  if (!imageUrl) throw new Error('Unexpected upscale API response');

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error('Failed to download upscaled image');
  const arrayBuf = await imgRes.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { fields, fileBuffer } = await parseMultipart(req);

    fileBuffer = await getImageBuffer(fields, fileBuffer);

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const targetWidth = parseInt(fields.targetWidth) || 2048;
    const targetHeight = parseInt(fields.targetHeight) || 2048;
    const autoUpscale = fields.autoUpscale === 'true';

    const originalMeta = await sharp(fileBuffer).metadata();
    let upscaled = false;

    // Auto-upscale: if source max dimension is smaller than target max dimension, upscale first
    if (autoUpscale) {
      const srcMax = Math.max(originalMeta.width, originalMeta.height);
      const tgtMax = Math.max(targetWidth, targetHeight);
      if (srcMax < tgtMax) {
        fileBuffer = await crispUpscale(fileBuffer, 'image/png', 'image.png');
        upscaled = true;
      }
    }

    const position = fields.smartCrop === 'true' ? 'entropy' : 'centre';

    let pipeline = sharp(fileBuffer);

    // Apply manual crop if provided
    if (fields.crop) {
      const cropData = JSON.parse(fields.crop);
      pipeline = pipeline.extract({
        left: Math.max(0, Math.round(cropData.left)),
        top: Math.max(0, Math.round(cropData.top)),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height)
      });
    }

    pipeline = pipeline
      .flatten({ background: '#ffffff' })
      .toColorspace('srgb')
      .resize(targetWidth, targetHeight, { fit: 'contain', background: '#ffffff', position })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true });

    const buffer = await pipeline.toBuffer();
    const metadata = await sharp(buffer).metadata();

    cleanupBlob(fields);

    res.status(200).json({
      width: metadata.width,
      height: metadata.height,
      format: 'jpeg',
      size: buffer.length,
      originalWidth: originalMeta.width,
      originalHeight: originalMeta.height,
      originalFormat: originalMeta.format,
      upscaled,
      data: `data:image/jpeg;base64,${buffer.toString('base64')}`
    });
  } catch (err) {
    console.error('Shopify export error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
