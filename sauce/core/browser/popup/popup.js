import { ToolkitStorage } from 'toolkit/core/storage';
import { browser } from 'toolkit/core/common/web-extensions';

const storage = new ToolkitStorage();
const manifest = browser.runtime.getManifest();

function updateToolkitLogo(isToolkitDisabled) {
  const logos = {
    false: 'assets/images/logos/toolkitforynab-logo-200.png',
    true: 'assets/images/logos/toolkitforynab-logo-200-disabled.png'
  };

  $('#logo').attr('src', chrome.runtime.getURL(logos[isToolkitDisabled]));
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

$('#openSettings').click(browser.runtime.openOptionsPage);
$('#reportBug').click(window.close);
$('#logo').click(toggleToolkit);

$('#versionNumber').text(manifest.version);

Promise.all([
  storage.getStorageItem('options.dark-mode', { default: false }),
  storage.getFeatureSetting('DisableToolkit', { default: false })
]).then(([isDarkMode, isToolkitDisabled]) => {
  applyDarkMode(isDarkMode);
  updateToolkitLogo(isToolkitDisabled);
});
