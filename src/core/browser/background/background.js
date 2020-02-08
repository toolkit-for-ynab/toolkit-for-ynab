import Raven from 'raven-js';
import { getBrowser, getBrowserName } from 'toolkit/core/common/web-extensions';
import { ToolkitStorage } from 'toolkit/core/common/storage';
import { getEnvironment } from 'toolkit/core/common/web-extensions';
import { Browser } from 'toolkit/core/common/constants';

const ONE_HOUR_MS = 1000 * 60 * 60;
const TOOLKIT_DISABLED_FEATURE_SETTING = 'DisableToolkit';
export const NEXT_UPDATE_CHECK_STORAGE_KEY = 'next-update-check';

export class Background {
  _browser = getBrowser();

  _storage = new ToolkitStorage();

  constructor() {
    this._initializeSentry();
    this._storage.getFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING).then(this._updatePopupIcon);
  }

  initListeners() {
    this._browser.runtime.onMessage.addListener(this._handleMessage);
    this._browser.runtime.onUpdateAvailable.addListener(this._handleUpdateAvailable);
    this._storage.onFeatureSettingChanged(TOOLKIT_DISABLED_FEATURE_SETTING, this._updatePopupIcon);
    this._checkForUpdates();
  }

  _handleUpdateAvailable = () => {
    this._browser.runtime.reload();
  };

  _checkForUpdates = async () => {
    if (getBrowserName() !== Browser.Chrome) {
      return;
    }

    const now = Date.now();
    const nextUpdateCheck = await this._storage.getStorageItem(NEXT_UPDATE_CHECK_STORAGE_KEY);

    if (!nextUpdateCheck || now >= nextUpdateCheck) {
      this._browser.runtime.requestUpdateCheck(status => {
        let nextCheck = now + ONE_HOUR_MS;
        if (status === 'throttled') {
          nextCheck += ONE_HOUR_MS;
        }

        this._storage.setStorageItem(NEXT_UPDATE_CHECK_STORAGE_KEY, nextCheck);
      });
    }

    setTimeout(this._checkForUpdates, ONE_HOUR_MS);
  };

  _handleMessage = (message, _sender, sendResponse) => {
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

  _handleUpdateAvailable = () => {
    this._browser.runtime.reload();
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
