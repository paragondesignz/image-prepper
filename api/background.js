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

    const color = fields.color || '#ffffff';
    const format = fields.format || 'png';
    const quality = parseInt(fields.quality) || 80;

    let pipeline = sharp(fileBuffer)
      .flatten({ background: color });

    switch (format) {
      case 'jpg':
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
      default:
        pipeline = pipeline.png({ quality: Math.min(quality, 100) });
    }

    const buffer = await pipeline.toBuffer();
    const metadata = await sharp(buffer).metadata();

    cleanupBlob(fields);

    res.status(200).json({
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
      data: `data:image/${format === 'jpg' ? 'jpeg' : format};base64,${buffer.toString('base64')}`
    });
  } catch (err) {
    console.error('Background error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
