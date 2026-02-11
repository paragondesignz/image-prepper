const sharp = require('sharp');
const { parseMultipart, getImageBuffer, cleanupBlob, validateDimension, validateQuality } = require('./_utils');

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

    let pipeline = sharp(fileBuffer);
    const inputMeta = await sharp(fileBuffer).metadata();

    // Validate and apply crop
    if (fields.crop) {
      const crop = JSON.parse(fields.crop);
      const left = parseInt(crop.left);
      const top = parseInt(crop.top);
      const width = parseInt(crop.width);
      const height = parseInt(crop.height);
      if (left < 0 || top < 0 || width < 1 || height < 1) {
        return res.status(400).json({ error: 'Invalid crop values' });
      }
      if (left + width > inputMeta.width || top + height > inputMeta.height) {
        return res.status(400).json({ error: 'Crop region exceeds image bounds' });
      }
      pipeline = pipeline.extract({ left, top, width, height });
    }

    // Validate and apply resize
    const width = fields.width ? validateDimension(fields.width, 'Width') : null;
    const height = fields.height ? validateDimension(fields.height, 'Height') : null;
    if (width || height) {
      const fit = fields.fit || 'fill';
      const resizeOpts = { fit };
      if (fit === 'contain') {
        const bg = fields.background || '#ffffff';
        resizeOpts.background = bg;
        pipeline = pipeline.flatten({ background: bg });
      }
      pipeline = pipeline.resize(width, height, resizeOpts);
    }

    const format = fields.format || 'png';
    const quality = fields.quality ? validateQuality(fields.quality) : 80;

    // Strip metadata if requested
    if (fields.stripMetadata === 'true') {
      pipeline = pipeline.withMetadata(false);
    }

    // Watermark composite
    if (fields.watermark) {
      const watermark = JSON.parse(fields.watermark);
      if (watermark.type === 'text' && watermark.text) {
        const currentMeta = await pipeline.clone().toBuffer().then(b => sharp(b).metadata());
        const imgW = currentMeta.width || inputMeta.width;
        const imgH = currentMeta.height || inputMeta.height;
        const fontSize = watermark.fontSize || 24;
        const opacity = Math.round((watermark.opacity || 0.5) * 255);
        const color = watermark.color || '#ffffff';
        const hexColor = color.replace('#', '');
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);

        const svgText = `<svg width="${imgW}" height="${imgH}">
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            font-size="${fontSize}" font-family="sans-serif"
            fill="rgba(${r},${g},${b},${opacity / 255})">${watermark.text}</text>
        </svg>`;
        const overlay = Buffer.from(svgText);
        pipeline = pipeline.composite([{ input: overlay, gravity: watermark.position || 'center' }]);
      } else if (watermark.type === 'image' && watermark.imageData) {
        const wmBuffer = Buffer.from(watermark.imageData.split(',')[1], 'base64');
        const wmOpacity = watermark.opacity || 0.5;
        const wmScale = watermark.scale || 0.2;
        const currentMeta = await pipeline.clone().toBuffer().then(b => sharp(b).metadata());
        const imgW = currentMeta.width || inputMeta.width;
        const targetW = Math.round(imgW * wmScale);
        const resizedWm = await sharp(wmBuffer)
          .resize(targetW)
          .ensureAlpha()
          .modulate({ brightness: 1 })
          .composite([{
            input: Buffer.from([255, 255, 255, Math.round(wmOpacity * 255)]),
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: 'dest-in'
          }])
          .toBuffer();
        const gravityMap = {
          'top-left': 'northwest', 'top-right': 'northeast',
          'bottom-left': 'southwest', 'bottom-right': 'southeast',
          'center': 'center'
        };
        pipeline = pipeline.composite([{
          input: resizedWm,
          gravity: gravityMap[watermark.position] || 'southeast'
        }]);
      }
    }

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
    console.error('Process error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
