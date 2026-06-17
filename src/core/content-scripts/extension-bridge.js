import { getBrowser } from 'toolkit/core/common/web-extensions';
import { ToolkitStorage, FEATURE_SETTING_PREFIX } from 'toolkit/core/common/storage';
import { allToolkitSettings, getUserSettings } from 'toolkit/core/settings';
import { getEnvironment } from 'toolkit/core/common/web-extensions';
import { createFeatureSettingValidator } from 'toolkit/core/content-scripts/feature-setting-validation';
import { InboundMessageType, OutboundMessageType, TOOLKIT_MESSAGE_CHANNEL } from '../messages';

const storage = new ToolkitStorage();

let toolkitInitiated = false;
const TRUSTED_ORIGIN = window.location.origin;
const validateFeatureSettingValue = createFeatureSettingValidator(allToolkitSettings);

function postToolkitMessage(payload) {
  window.postMessage(
    {
      ...payload,
      channel: TOOLKIT_MESSAGE_CHANNEL,
    },
    TRUSTED_ORIGIN,
  );
}

function isTrustedToolkitMessage(event) {
  return (
    event &&
    event.source === window &&
    event.origin === TRUSTED_ORIGIN &&
    event.data?.channel === TOOLKIT_MESSAGE_CHANNEL &&
    typeof event.data?.type === 'string'
  );
}

function sendToolkitBootstrap(options) {
  const browser = getBrowser();
  const environment = getEnvironment();
  const manifest = browser.runtime.getManifest();

  postToolkitMessage({
    type: InboundMessageType.Bootstrap,
    ynabToolKit: {
      assets: {
        logo: browser.runtime.getURL('assets/images/logos/toolkitforynab-logo-200.png'),
      },
      environment,
      extensionId: browser.runtime.id,
      name: manifest.name,
      options,
      version: manifest.version,
    },
  });
}

function toolkitMessageHandler(event) {
  if (!isTrustedToolkitMessage(event)) {
    return;
  }

  switch (event.data.type) {
    case OutboundMessageType.ToolkitLoaded:
      initializeYNABToolkit();
      break;
    case OutboundMessageType.ToolkitError:
      handleToolkitError(event.data.context);
      break;
    case 'ynab-toolkit-set-setting':
      handleSetFeatureSetting(event.data.setting);
      break;
  }
}

function handleToolkitError(context) {
  getBrowser().runtime.sendMessage({ type: 'error', context });
}

function handleSetFeatureSetting({ name, value }) {
  const normalizedValue = validateFeatureSettingValue(name, value);
  if (normalizedValue === null) {
    console.warn('Ignoring invalid feature setting update', { name, value });
    return;
  }

  storage.setFeatureSetting(name, normalizedValue);
}

function handleFeatureSettingChanged(settingName, newValue) {
  if (settingName.startsWith(FEATURE_SETTING_PREFIX)) {
    postToolkitMessage({
      type: InboundMessageType.SettingChanged,
      setting: {
        name: settingName.slice(FEATURE_SETTING_PREFIX.length),
        value: newValue,
      },
    });
  }
}

async function initializeYNABToolkit() {
  const userSettings = await getUserSettings();
  sendToolkitBootstrap(userSettings);
}

async function init() {
  const isToolkitDisabled = await storage.getFeatureSetting('DisableToolkit');
  if (isToolkitDisabled) {
    console.log(`${getBrowser().runtime.getManifest().name} is disabled!`);
    return;
  }

  if (toolkitInitiated) {
    console.log(`${getBrowser().runtime.getManifest().name} is already initiated`);
    return;
  }

  console.log(`${getBrowser().runtime.getManifest().name} initiated`);

  // Load the toolkit bundle onto the YNAB dom
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', getBrowser().runtime.getURL('web-accessibles/ynab-toolkit.js'));
  document.getElementsByTagName('head')[0].appendChild(script);
  toolkitInitiated = true;

  // wait for the bundle to tell us it's loaded
  window.addEventListener('message', toolkitMessageHandler);

  allToolkitSettings.forEach(({ name }) => {
    storage.onFeatureSettingChanged(name, handleFeatureSettingChanged);
  });
}

init();
storage.onToolkitDisabledChanged((_, isDisabled) => {
  if (!isDisabled) {
    init();
  }
});
