const { parseMultipart, getImageBuffer, cleanupBlob } = require('./_utils');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { fields, fileBuffer, fileMeta } = await parseMultipart(req);

    fileBuffer = await getImageBuffer(fields, fileBuffer);

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

    const blob = new Blob([fileBuffer], { type: fileMeta.mimeType });
    const form = new FormData();
    form.append('file', blob, fileMeta.filename);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: form
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Recraft API error: ${errText}` });
    }

    cleanupBlob(fields);

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    console.error('Upscale error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
