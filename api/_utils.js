const Busboy = require('busboy');
const { del } = require('@vercel/blob');

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let fileBuffer = null;
    let fileMeta = { filename: 'image.png', mimeType: 'image/png' };

    const busboy = Busboy({ headers: req.headers });

    busboy.on('file', (fieldname, file, info) => {
      const chunks = [];
      if (info) {
        fileMeta = { filename: info.filename || 'image.png', mimeType: info.mimeType || 'image/png' };
      }
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

async function getImageBuffer(fields, fileBuffer) {
  if (!fileBuffer && fields.blobUrl) {
    const blobRes = await fetch(fields.blobUrl);
    fileBuffer = Buffer.from(await blobRes.arrayBuffer());
  }
  return fileBuffer;
}

function cleanupBlob(fields) {
  if (fields.blobUrl) del(fields.blobUrl).catch(() => {});
}

function validateDimension(value, name) {
  const num = parseInt(value);
  if (isNaN(num) || num < 1 || num > 16384) {
    throw new Error(`${name} must be between 1 and 16384`);
  }
  return num;
}

function validateQuality(value) {
  const num = parseInt(value);
  if (isNaN(num) || num < 1 || num > 100) {
    throw new Error('Quality must be between 1 and 100');
  }
  return num;
}

module.exports = { parseMultipart, getImageBuffer, cleanupBlob, validateDimension, validateQuality };
