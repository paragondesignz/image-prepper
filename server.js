require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const FormData = require('form-data');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    let pipeline = sharp(req.file.buffer);

    if (req.body.crop) {
      const crop = JSON.parse(req.body.crop);
      pipeline = pipeline.extract({
        left: parseInt(crop.left),
        top: parseInt(crop.top),
        width: parseInt(crop.width),
        height: parseInt(crop.height)
      });
    }

    const width = req.body.width ? parseInt(req.body.width) : null;
    const height = req.body.height ? parseInt(req.body.height) : null;
    if (width || height) {
      pipeline = pipeline.resize(width, height, { fit: 'fill' });
    }

    const format = req.body.format || 'png';
    const quality = parseInt(req.body.quality) || 80;

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

    res.json({
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
});

app.post('/api/upscale', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const apiKey = process.env.RECRAFT_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return res.status(400).json({ error: 'RECRAFT_API_KEY not configured in .env' });
    }

    const type = req.body.type || 'crisp';
    const endpoint = type === 'creative'
      ? 'https://external.api.recraft.ai/v1/images/creativeUpscale'
      : 'https://external.api.recraft.ai/v1/images/crispUpscale';

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'image.png',
      contentType: req.file.mimetype
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Recraft API error: ${errText}` });
    }

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error('Upscale error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Image Prepper running at http://localhost:${PORT}`);
});
