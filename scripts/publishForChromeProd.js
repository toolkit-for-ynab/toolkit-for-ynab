const fs = require('fs');
const path = require('path');
const glob = require('glob');

const EXTENSION_ID = 'lmhdkkhepllpnondndgpgclfjnlofgjl';
const DIST_DIR = path.join(__dirname, '..', 'dist');

function getEnvOrExit(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const clientId = getEnvOrExit('GOOGLE_CLIENT_ID');
  const clientSecret = getEnvOrExit('GOOGLE_CLIENT_SECRET');
  const refreshToken = getEnvOrExit('GOOGLE_REFRESH_TOKEN');

  const zips = glob.sync('toolkit-for-ynab-v*-chrome.zip', { cwd: DIST_DIR, absolute: true });
  if (zips.length !== 1) throw new Error(`Expected 1 Chrome zip, found ${zips.length}`);

  const webStore = require('chrome-webstore-upload').default({
    extensionId: EXTENSION_ID,
    clientId,
    clientSecret,
    refreshToken,
  });

  console.log(`Uploading ${path.basename(zips[0])} to Chrome Web Store...`);
  const token = await webStore.fetchToken();

  const uploadResult = await webStore.uploadExisting(fs.createReadStream(zips[0]), token);
  if (uploadResult.uploadState !== 'SUCCESS') {
    console.error('Upload failed:', uploadResult);
    process.exit(1);
  }

  console.log('Publishing to all users...');
  const publishResult = await webStore.publish('default', token);
  if (!publishResult.status.includes('OK')) {
    console.error('Publish failed:', publishResult);
    process.exit(1);
  }

  console.log('Successfully published to Chrome Web Store.');
}

main().catch((e) => {
  console.error('Chrome publish failed:', e.message);
  process.exit(1);
});
