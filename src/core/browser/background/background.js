import { getBrowser } from 'toolkit/core/common/web-extensions';
import { ToolkitStorage } from 'toolkit/core/common/storage';

const TOOLKIT_DISABLED_FEATURE_SETTING = 'DisableToolkit';

export class Background {
  _browser = getBrowser();
  _storage = new ToolkitStorage();

  constructor() {
    this._storage.getFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING)
      .then(this._updatePopupIcon);
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
      default:
        console.log('unknown message', message);
    }
  }

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
  }

  _updatePopupIcon = (isToolkitDisabled) => {
    const imagePath = `assets/images/icons/button${isToolkitDisabled ? '-disabled' : ''}.png`;
    const imageURL = this._browser.runtime.getURL(imagePath);
    this._browser.browserAction.setIcon({ path: imageURL });
  }
}
