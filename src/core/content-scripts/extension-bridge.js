import { getBrowser } from 'toolkit/core/common/web-extensions';
import { ToolkitStorage, FEATURE_SETTING_PREFIX } from 'toolkit/core/common/storage';
import { allToolkitSettings, getUserSettings } from 'toolkit/core/settings';
import { getEnvironment } from 'toolkit/core/common/web-extensions';
import { InboundMessageType, OutboundMessageType } from '../messages';

const storage = new ToolkitStorage();

let toolkitInitiated = false;

function sendToolkitBootstrap(options) {
  const browser = getBrowser();
  const environment = getEnvironment();
  const manifest = browser.runtime.getManifest();

  window.postMessage(
    {
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
    },
    '*'
  );
}

function toolkitMessageHandler(event) {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case OutboundMessageType.ToolkitLoaded:
        initializeYNABToolkit();
        break;
      case 'ynab-toolkit-error':
        handleToolkitError(event.data.context);
        break;
      case 'ynab-toolkit-set-setting':
        handleSetFeatureSetting(event.data.setting);
    }
  }
}

function handleToolkitError(context) {
  getBrowser().runtime.sendMessage({ type: 'error', context });
}

function handleSetFeatureSetting({ name, value }) {
  storage.setFeatureSetting(name, value);
}

function handleFeatureSettingChanged(settingName, newValue) {
  if (settingName.startsWith(FEATURE_SETTING_PREFIX)) {
    window.postMessage({
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
