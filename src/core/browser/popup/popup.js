import { ToolkitStorage } from 'toolkit/core/common/storage';
import { getBrowser, getBrowserName } from 'toolkit/core/common/web-extensions';

const storage = new ToolkitStorage();
const manifest = getBrowser().runtime.getManifest();

function updateToolkitLogo(isToolkitDisabled) {
  const logos = {
    false: 'assets/images/logos/toolkitforynab-logo-200.png',
    true: 'assets/images/logos/toolkitforynab-logo-200-disabled.png'
  };

  $('#logo').attr('src', getBrowser().runtime.getURL(logos[isToolkitDisabled]));
}

function toggleToolkit() {
  storage.getFeatureSetting('DisableToolkit').then((value) => {
    storage.setFeatureSetting('DisableToolkit', !value);
  });
}

function applyDarkMode(activate) {
  if (activate) {
    $('body').addClass('inverted');
  } else {
    $('body').removeClass('inverted');
  }
}

storage.onFeatureSettingChanged('DisableToolkit', updateToolkitLogo);

$('#openSettings').click(() => {
  const _browser = getBrowser();

  if (getBrowserName() === 'edge') {
    _browser.tabs.create({ url: _browser.runtime.getURL('options/index.html') });
  } else {
    _browser.runtime.openOptionsPage();
  }
});

$('#reportBug').click(() => window.close());
$('#logo').click(() => toggleToolkit());

$('#versionNumber').text(manifest.version);

Promise.all([
  storage.getStorageItem('options.dark-mode', { default: false }),
  storage.getFeatureSetting('DisableToolkit', { default: false })
]).then(([isDarkMode, isToolkitDisabled]) => {
  applyDarkMode(isDarkMode);
  updateToolkitLogo(isToolkitDisabled);
});
