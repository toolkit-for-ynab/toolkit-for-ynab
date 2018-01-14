const fs = require('fs');
const glob = require('glob');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');
const extensionPath = path.join(workspaceRoot, 'dist');

// Are we on the correct branch?
if (process.env.TRAVIS_BRANCH !== 'beta') {
  console.log(`TRAVIS_BRANCH is '${process.env.TRAVIS_BRANCH}'.`);
  console.log('Either we\'re on the wrong branch or we\'re not on Travis. Either way, no need to publish.');
  process.exit(0);
}

// Validate that we have all the config we need.
if (!process.env.EXTENSION_ID) {
  console.error('The EXTENSION_ID env var is required.');
  process.exit(1);
}
if (!process.env.CLIENT_ID) {
  console.error('The CLIENT_ID env var is required.');
  process.exit(2);
}
if (!process.env.CLIENT_SECRET) {
  console.error('The CLIENT_SECRET env var is required.');
  process.exit(3);
}
if (!process.env.REFRESH_TOKEN) {
  console.error('The REFRESH_TOKEN env var is required.');
  process.exit(4);
}

// Look for our zip file to upload
const results = glob.sync(path.join(extensionPath, '*.zip'));

if (results.length < 1) {
  console.error('Found no extension to upload, ensure you\'ve built first.');
  process.exit(5);
} else if (results.length > 1) {
  console.error('Found multiple extensions to upload. Quitting.', results);
  process.exit(6);
}

// Ok, it looks like we have what we need. Let's go!
const webStore = require('chrome-webstore-upload')({
  extensionId: process.env.EXTENSION_ID,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN
});

const extension = fs.createReadStream(results[0]);

console.log('Uploading to Chrome Web Store...');

webStore
  .uploadExisting(extension)
  .then(res => {
    if (res.uploadState !== 'SUCCESS') {
      console.error('Received non-success response from Google.');
      console.error(res);
      process.exit(7);
    } else {
      console.log('Successfully uploaded to Chrome Web Store.');
    }
  });
