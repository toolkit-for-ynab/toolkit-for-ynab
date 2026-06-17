const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');

const ADDON_ID = '{4F1FB113-D7D8-40AE-A5BA-9300EAEA0F51}';
const AMO_API_BASE = 'https://addons.mozilla.org/api/v5';
const DIST_DIR = path.join(__dirname, '..', 'dist');

function getEnvOrExit(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function generateJwt(apiKey, apiSecret) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iss: apiKey, iat: now, exp: now + 300 })).toString(
    'base64url',
  );
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

async function amoRequest(token, url, options = {}) {
  const res = await fetch(`${AMO_API_BASE}${url}`, {
    ...options,
    headers: { Authorization: `JWT ${token}`, ...options.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AMO API ${res.status} at ${url}: ${text}`);
  }
  return res.json();
}

async function uploadExtension(token, zipPath) {
  console.log(`Uploading ${path.basename(zipPath)}...`);
  const form = new FormData();
  form.append('upload', new Blob([fs.readFileSync(zipPath)]), path.basename(zipPath));
  form.append('channel', 'listed');
  return amoRequest(token, '/addons/upload/', { method: 'POST', body: form });
}

async function pollUpload(token, uuid, attempts = 0) {
  if (attempts === 0) console.log('Waiting for AMO validation...');
  if (attempts >= 30) throw new Error('Timed out waiting for AMO to process upload');
  const data = await amoRequest(token, `/addons/upload/${uuid}/`);
  if (data.processed) {
    if (!data.valid) throw new Error(`AMO validation failed: ${JSON.stringify(data.validation)}`);
    return data;
  }
  await new Promise((r) => {
    setTimeout(r, 3000);
  });
  return pollUpload(token, uuid, attempts + 1);
}

async function createVersion(token, uploadUuid, sourceZipPath) {
  console.log(`Creating version with source code (${path.basename(sourceZipPath)})...`);
  const form = new FormData();
  form.append('upload', uploadUuid);
  form.append('source', new Blob([fs.readFileSync(sourceZipPath)]), path.basename(sourceZipPath));
  return amoRequest(token, `/addons/${encodeURIComponent(ADDON_ID)}/versions/`, {
    method: 'POST',
    body: form,
  });
}

async function main() {
  const apiKey = getEnvOrExit('AMO_JWT_KEY');
  const apiSecret = getEnvOrExit('AMO_JWT_SECRET');

  const extensionZips = glob.sync('toolkit-for-ynab-v*-firefox.zip', {
    cwd: DIST_DIR,
    absolute: true,
  });
  const sourceZips = glob.sync('toolkit-for-ynab-source-v*-firefox.zip', {
    cwd: DIST_DIR,
    absolute: true,
  });

  if (extensionZips.length !== 1)
    throw new Error(`Expected 1 Firefox extension zip, found ${extensionZips.length}`);
  if (sourceZips.length !== 1)
    throw new Error(`Expected 1 Firefox source zip, found ${sourceZips.length}`);

  const token = generateJwt(apiKey, apiSecret);

  const upload = await uploadExtension(token, extensionZips[0]);
  await pollUpload(token, upload.uuid);
  const version = await createVersion(token, upload.uuid, sourceZips[0]);

  console.log(`Successfully submitted Firefox v${version.version} to AMO for review.`);
}

main().catch((e) => {
  console.error('Firefox publish failed:', e.message);
  process.exit(1);
});
