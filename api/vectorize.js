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

    const blob = new Blob([fileBuffer], { type: fileMeta.mimeType });
    const form = new FormData();
    form.append('file', blob, fileMeta.filename);

    const response = await fetch('https://external.api.recraft.ai/v1/images/vectorize', {
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
    const svgUrl = result.image && result.image.url;
    if (!svgUrl) {
      return res.status(500).json({ error: 'Unexpected API response: no image URL' });
    }

    // Fetch the SVG content from the returned URL
    const svgRes = await fetch(svgUrl);
    if (!svgRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch SVG from Recraft' });
    }
    const svgText = await svgRes.text();
    const svgBase64 = Buffer.from(svgText).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    // Extract dimensions from SVG if possible
    const widthMatch = svgText.match(/width="(\d+)/);
    const heightMatch = svgText.match(/height="(\d+)/);
    const width = widthMatch ? parseInt(widthMatch[1]) : 0;
    const height = heightMatch ? parseInt(heightMatch[1]) : 0;

    res.status(200).json({
      data: dataUrl,
      width,
      height,
      size: svgText.length,
      format: 'svg'
    });
  } catch (err) {
    console.error('Vectorize error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
