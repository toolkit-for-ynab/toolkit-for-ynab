import 'babel-polyfill';
import { features } from 'toolkit/extension/features';
import { isYNABReady } from 'toolkit/extension/utils/ynab';
import { isFeatureEnabled } from 'toolkit/extension/utils/feature';
import { logToolkitError, withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';

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
    const wrappedShouldInvoke = feature.shouldInvoke.bind(feature);
    const wrappedInvoke = feature.invoke.bind(feature);
    if (isFeatureEnabled(feature) && wrappedShouldInvoke()) {
      wrappedInvoke();
    }
  }

  _applyGlobalCSS() {
    const globalCSS = this._featureInstances.reduce((css, feature) => {
      const wrappedInjectCSS = withToolkitError(feature.injectCSS.bind(feature), feature);
      const featureCSS = wrappedInjectCSS();

      if (isFeatureEnabled(feature) && featureCSS) {
        css += `/* == Injected CSS from feature: ${feature.constructor.name} == */\n${featureCSS}\n\n`;
      }

      return css;
    }, require('./ynab-toolkit.css'));

    $('head').append($('<style>', { id: 'toolkit-injected-styles', type: 'text/css' })
      .text(globalCSS));
  }

  _invokeFeatureInstances = async () => {
    this._featureInstances.forEach(async (feature) => {
      if (isFeatureEnabled(feature)) {
        feature.applyListeners();

        try {
          await feature.willInvoke();
        } catch (exception) {
          const featureName = feature.constructor.name;
          const featureSetting = ynabToolKit.options[featureName];
          logToolkitError(exception, featureName, 'willInvoke', featureSetting);
        }

        const wrappedShouldInvoke = withToolkitError(feature.shouldInvoke.bind(feature), feature);
        const wrappedInvoke = withToolkitError(feature.invoke.bind(feature), feature);
        if (wrappedShouldInvoke()) {
          wrappedInvoke();
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
        ynabToolKit.invokeFeature = self._invokeFeature;

        // inject the global css from each feature into the HEAD of the DOM
        self._applyGlobalCSS();

        // Hook up listeners and then invoke any features that are ready to go.
        self._invokeFeatureInstances();
      } else if (typeof Ember !== 'undefined') {
        Ember.run.later(poll, 250);
      } else {
        setTimeout(poll, 250);
      }
    }());
  }
}
