const fs = require('fs');
const glob = require('glob');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');
const extensionPath = path.join(workspaceRoot, 'dist');

const uploadToWebStore = async () => {
  // Are we on the correct branch?
  if (process.env.TRAVIS_BRANCH !== 'beta') {
    console.log(`TRAVIS_BRANCH is '${process.env.TRAVIS_BRANCH}'.`);
    console.log('Either we\'re on the wrong branch or we\'re not on Travis. Either way, no need to publish.');
    process.exit(0);
  }

  // Validate that we have all the config we need.
  if (!process.env.CHROME_EXTENSION_ID) {
    console.error('The CHROME_EXTENSION_ID env var is required.');
    process.exit(1);
  }
  if (!process.env.CHROME_CLIENT_ID) {
    console.error('The CHROME_CLIENT_ID env var is required.');
    process.exit(2);
  }
  if (!process.env.CHROME_CLIENT_SECRET) {
    console.error('The CHROME_CLIENT_SECRET env var is required.');
    process.exit(3);
  }
  if (!process.env.CHROME_REFRESH_TOKEN) {
    console.error('The CHROME_REFRESH_TOKEN env var is required.');
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
    extensionId: process.env.CHROME_EXTENSION_ID,
    clientId: process.env.CHROME_CLIENT_ID,
    clientSecret: process.env.CHROME_CLIENT_SECRET,
    refreshToken: process.env.CHROME_REFRESH_TOKEN
  });

  const extension = fs.createReadStream(results[0]);

  console.log('Uploading to Chrome Web Store.');

  // Get an Auth Token
  console.log('Fetching Auth Token...');
  const token = await webStore.fetchToken();

  // Upload the extension
  console.log('Uploading Extension...');
  const uploadResult = await webStore.uploadExisting(extension, token);
  if (uploadResult.uploadState !== 'SUCCESS') {
    console.error('Received non-success response from Google.');
    console.error(uploadResult);
    process.exit(7);
  }

  // And publish!
  console.log('Publishing Extension...');
  const publishResult = await webStore.publish('trustedTesters', token);
  if (publishResult.status.indexOf('OK') < 0) {
    console.error('Received non-success response from Google.');
    console.error(publishResult);
    process.exit(8);
  }

  console.log('Successfully uploaded and published extension.');
};

uploadToWebStore();
