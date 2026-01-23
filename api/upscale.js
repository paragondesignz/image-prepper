const Busboy = require('busboy');
const FormData = require('form-data');

export const config = {
  api: { bodyParser: false }
};

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let fileBuffer = null;
    let fileMeta = {};

    const busboy = Busboy({ headers: req.headers });

    busboy.on('file', (fieldname, file, info) => {
      const chunks = [];
      fileMeta = { filename: info.filename || 'image.png', mimeType: info.mimeType || 'image/png' };
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('finish', () => {
      resolve({ fields, fileBuffer, fileMeta });
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
    const { fields, fileBuffer, fileMeta } = await parseMultipart(req);

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = process.env.RECRAFT_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return res.status(400).json({ error: 'RECRAFT_API_KEY not configured' });
    }

    const type = fields.type || 'crisp';
    const endpoint = type === 'creative'
      ? 'https://external.api.recraft.ai/v1/images/creativeUpscale'
      : 'https://external.api.recraft.ai/v1/images/crispUpscale';

    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: fileMeta.filename,
      contentType: fileMeta.mimeType
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
    res.status(200).json(result);
  } catch (err) {
    console.error('Upscale error:', err);
    res.status(500).json({ error: err.message });
  }
}
