const sharp = require('sharp');
const { parseMultipart, getImageBuffer, cleanupBlob } = require('./_utils');

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

    const originalMeta = await sharp(fileBuffer).metadata();
    const position = fields.smartCrop === 'true' ? 'entropy' : 'centre';

    // Shopify optimal: 2048x2048 square, progressive JPEG, quality 82, sRGB, white bg
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
      .resize(2048, 2048, { fit: 'contain', background: '#ffffff', position })
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
      data: `data:image/jpeg;base64,${buffer.toString('base64')}`
    });
  } catch (err) {
    console.error('Shopify export error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
