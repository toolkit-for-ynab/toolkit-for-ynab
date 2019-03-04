import Raven from 'raven-js';
import { getBrowser } from 'toolkit/core/common/web-extensions';
import { ToolkitStorage } from 'toolkit/core/common/storage';
import { getEnvironment } from 'toolkit/core/common/web-extensions';

const TOOLKIT_DISABLED_FEATURE_SETTING = 'DisableToolkit';

export class Background {
  _browser = getBrowser();
  _storage = new ToolkitStorage();

  constructor() {
    this._initializeSentry();
    this._storage.getFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING).then(this._updatePopupIcon);
  }

  initListeners() {
    this._browser.runtime.onMessage.addListener(this._handleMessage);
    this._storage.onFeatureSettingChanged('DisableToolkit', this._updatePopupIcon);
  }

  _handleMessage = (message, sender, sendResponse) => {
    switch (message.type) {
      case 'storage':
        this._handleStorageMessage(message.content, sendResponse);
        break;
      case 'error':
        this._handleException(message.context, sendResponse);
        break;
      default:
        console.log('unknown message', message);
    }
  };

  _handleException = context => {
    Raven.captureException(new Error(context.serializedError), {
      tags: {
        featureName: context.featureName,
      },
      extra: {
        featureSetting: context.featureSetting,
        functionName: context.functionName,
        routeName: context.routeName,
      },
    });
  };

  _handleStorageMessage = (request, callback) => {
    switch (request.type) {
      case 'keys':
        callback(Object.keys(localStorage));
        break;
      case 'get':
        callback(localStorage.getItem(request.itemName));
        break;
      default:
        console.log('unknown storage request', request);
    }
  };

  _initializeSentry() {
    const environment = getEnvironment();
    const context = {
      environment,
      release: this._browser.runtime.getManifest().version,
    };

    if (environment !== 'development') {
      Raven.config('https://119c2693bc2a4ed18052ef40ce4adc3c@sentry.io/1218490', context).install();
      Raven.setExtraContext(context);
    }
  }

  _updatePopupIcon = isToolkitDisabled => {
    const imagePath = `assets/images/icons/button${isToolkitDisabled ? '-disabled' : ''}.png`;
    const imageURL = this._browser.runtime.getURL(imagePath);
    this._browser.browserAction.setIcon({ path: imageURL });
  };
}
