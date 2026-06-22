const path = require('path');
const glob = require('glob');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

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
  const apiKey = getEnvOrExit('AMO_JWT_KEY');
  const apiSecret = getEnvOrExit('AMO_JWT_SECRET');

  const [extensionZip] = glob.sync('toolkit-for-ynab-v*-firefox.zip', {
    cwd: DIST_DIR,
    absolute: true,
  });
  if (!extensionZip) throw new Error('No Firefox extension zip found in dist/');

  const [sourceZip] = glob.sync('toolkit-for-ynab-source-v*-firefox.zip', {
    cwd: DIST_DIR,
    absolute: true,
  });
  if (!sourceZip) throw new Error('No Firefox source zip found in dist/');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ynab-firefox-'));

  try {
    console.log(`Extracting ${path.basename(extensionZip)}...`);
    execFileSync('unzip', ['-q', extensionZip, '-d', tempDir]);

    console.log('Submitting to Firefox AMO...');
    const webExt = require('web-ext').default;
    await webExt.cmd.sign(
      {
        sourceDir: tempDir,
        artifactsDir: DIST_DIR,
        channel: 'listed',
        apiKey,
        apiSecret,
        amoBaseUrl: 'https://addons.mozilla.org/api/v5/',
        uploadSourceCode: sourceZip,
        approvalTimeout: 0,
        noInput: true,
      },
      { shouldExitProgram: false },
    );

    console.log('Successfully submitted to Firefox AMO.');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error('Firefox publish failed:', e.message);
  process.exit(1);
});
