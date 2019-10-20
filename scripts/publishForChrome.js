const fs = require('fs');
const glob = require('glob');
const path = require('path');
const request = require('request');

const workspaceRoot = path.join(__dirname, '..');
const extensionDistPath = path.join(workspaceRoot, 'dist');

function getEnvironmentOrExit(variable) {
  if (!process.env[variable]) {
    console.log(`The ${variable} env var is required.`);
    process.exit(1);
  }

  return process.env[variable];
}

function getEnvironmentVariables() {
  return {
    travisBranch: getEnvironmentOrExit('TRAVIS_BRANCH'),
    chromeExtensionId: getEnvironmentOrExit('CHROME_EXTENSION_ID'),
    chromeClientId: getEnvironmentOrExit('CHROME_CLIENT_ID'),
    chromeClientSecret: getEnvironmentOrExit('CHROME_CLIENT_SECRET'),
    chromeRefreshToken: getEnvironmentOrExit('CHROME_REFRESH_TOKEN'),
    sentryAuthToken: getEnvironmentOrExit('SENTRY_AUTH_TOKEN'),
  };
}

async function uploadToWebStore(environmentVariables) {
  // Look for our zip file to upload
  let results = glob.sync(path.join(extensionDistPath, '*.zip'));

  // Remove our 'source' zip.
  results = results.filter(result => result.indexOf('source') < 0);

  if (results.length < 1) {
    console.error("Found no extension to upload, ensure you've built first.");
    process.exit(5);
  } else if (results.length > 1) {
    console.error('Found multiple extensions to upload. Quitting.', results);
    process.exit(6);
  }

  // Ok, it looks like we have what we need. Let's go!
  const webStore = require('chrome-webstore-upload')({
    extensionId: environmentVariables.chromeExtensionId,
    clientId: environmentVariables.chromeClientId,
    clientSecret: environmentVariables.chromeClientSecret,
    refreshToken: environmentVariables.chromeRefreshToken,
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
}

async function uploadSourcemapsToSentry({ sentryAuthToken }) {
  console.log(sentryAuthToken);
  const version = require(`${extensionDistPath}/extension/manifest.json`).version;

  try {
    await request({
      json: {
        projects: ['toolkit-for-ynab'],
        version: `${version}`,
      },
      headers: {
        Authorization: `Bearer ${sentryAuthToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: 'https://sentry.io/api/0/organizations/toolkit-for-ynab/releases/',
    });

    console.log(`Release: ${version} created`);
  } catch (error) {
    console.log(`Failed to create release for ${version}.\n`, error);
  }

  glob(`${extensionDistPath}/**/*.{js,map}`, async (_, files) => {
    try {
      await Promise.all(
        files.map(filePath => {
          return new Promise((resolve, reject) => {
            request(
              {
                formData: {
                  file: fs.createReadStream(filePath),
                  name: filePath.replace(`${extensionDistPath}/extension/`, '~/'),
                },
                headers: {
                  Authorization: `Bearer ${sentryAuthToken}`,
                  'Content-Type': 'multipart/form-data',
                },
                method: 'POST',
                url: `https://sentry.io/api/0/projects/toolkit-for-ynab/toolkit-for-ynab/releases/${version}/files/`,
              },
              error => {
                if (error) {
                  console.log(`${filePath}: failure`);
                  return reject();
                }

                console.log(`${filePath}: success`);
                resolve();
              }
            );
          });
        })
      );
    } catch (error) {
      console.log('Error uploading files: ', error);
    }
  });
}

async function publishForChrome() {
  const environmentVariables = getEnvironmentVariables();
  // Are we on the correct branch?
  if (environmentVariables.travisBranch !== 'beta') {
    console.log(`TRAVIS_BRANCH is '${environmentVariables.travisBranch}'.`);
    console.log(
      "Either we're on the wrong branch or we're not on Travis. Either way, no need to publish."
    );
    process.exit(0);
  }

  await uploadToWebStore(environmentVariables);
  await uploadSourcemapsToSentry(environmentVariables);
}

publishForChrome();
