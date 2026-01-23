const Busboy = require('busboy');
const sharp = require('sharp');

export const config = {
  api: { bodyParser: false }
};

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let fileBuffer = null;

    const busboy = Busboy({ headers: req.headers });

    busboy.on('file', (fieldname, file) => {
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('finish', () => {
      resolve({ fields, fileBuffer });
    });

    busboy.on('error', reject);

    req.pipe(busboy);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, fileBuffer } = await parseMultipart(req);

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No image provided' });
    }

    let pipeline = sharp(fileBuffer);

    if (fields.crop) {
      const crop = JSON.parse(fields.crop);
      pipeline = pipeline.extract({
        left: parseInt(crop.left),
        top: parseInt(crop.top),
        width: parseInt(crop.width),
        height: parseInt(crop.height)
      });
    }

    const width = fields.width ? parseInt(fields.width) : null;
    const height = fields.height ? parseInt(fields.height) : null;
    if (width || height) {
      pipeline = pipeline.resize(width, height, { fit: 'fill' });
    }

    const format = fields.format || 'png';
    const quality = parseInt(fields.quality) || 80;

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
