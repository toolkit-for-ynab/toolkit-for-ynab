import 'babel-polyfill';
import { features } from 'toolkit/extension/features';
import { isYNABReady } from 'toolkit/extension/utils/ynab';
import { isFeatureEnabled } from 'toolkit/extension/utils/feature';

export const TOOLKIT_LOADED_MESSAGE = 'ynab-toolkit-loaded';
export const TOOLKIT_BOOTSTRAP_MESSAGE = 'ynab-toolkit-bootstrap';

export class YNABToolkit {
  _featureInstances = [];

  initializeToolkit() {
    window.addEventListener('message', this._onBackgroundMessage);
    window.postMessage(TOOLKIT_LOADED_MESSAGE, '*');
  }

  _removeMessageListener() {
    window.removeEventListener('message', this._onBackgroundMessage);
  }

  _createFeatureInstances() {
    features.forEach((Feature) => {
      this._featureInstances.push(new Feature());
    });
  }

  _onBackgroundMessage = (event) => {
    if (
      event.source === window &&
      event.data.type === TOOLKIT_BOOTSTRAP_MESSAGE
    ) {
      window.ynabToolKit = event.data.ynabToolKit;
      this._createFeatureInstances();
      this._removeMessageListener();
      this._waitForUserSettings();
    }
  }

  _invokeFeature = (featureName) => {
    const feature = this._featureInstances.find((f) => f.constructor.name === featureName);
    if (isFeatureEnabled(feature) && feature.shouldInvoke()) {
      feature.invoke();
    }
  }

  _applyGlobalCSS() {
    const globalCSS = this._featureInstances.reduce((css, feature) => {
      if (isFeatureEnabled(feature) && feature.injectCSS()) {
        css += `/* == Injected CSS from feature: ${feature.constructor.name} == */\n\n${feature.injectCSS()}\n`;
      }

      return css;
    }, '');

    $('head').append($('<style>', { id: 'toolkit-injected-styles', type: 'text/css' })
      .text(globalCSS));
  }

  _invokeFeatureInstances = async () => {
    this._featureInstances.forEach(async (feature) => {
      if (isFeatureEnabled(feature)) {
        feature.applyListeners();

        await feature.willInvoke();
        if (feature.shouldInvoke()) {
          feature.invoke();
        }
      }
    });
  }

  _waitForUserSettings() {
    const self = this;

    (function poll() {
      if (isYNABReady()) {
        // add a global invokeFeature to the global ynabToolKit for legacy features
        // once leagcy features have been removed, this should be a global exported function
        // from this file that features can require and use
        ynabToolKit.invokeFeature = this._invokeFeature;

        // inject the global css from each feature into the HEAD of the DOM
        self._applyGlobalCSS();

        // Hook up listeners and then invoke any features that are ready to go.
        self._invokeFeatureInstances();
      } else {
        setTimeout(poll, 250);
      }
    }());
  }
}
