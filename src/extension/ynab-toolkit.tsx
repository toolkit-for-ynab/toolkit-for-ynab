import * as React from 'react';
import { features } from 'toolkit/extension/features';
import * as ynabUtils from 'toolkit/extension/utils/ynab';
import * as emberUtils from 'toolkit/extension/utils/ember';
import * as Collections from 'toolkit/extension/utils/collections';
import { isFeatureEnabled } from 'toolkit/extension/utils/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { logToolkitError, withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { compareSemanticVersion } from './utils/helpers';
import { componentAppend } from './utils/react';
import { ToolkitReleaseModal } from 'toolkit/core/components/toolkit-release-modal';
import { Feature } from './features/feature';
import { InboundMessage, InboundMessageType, OutboundMessageType } from 'toolkit/core/messages';
import { ObserveListener, RouteChangeListener } from './listeners';

export let observeListener: ObserveListener;
export let routeChangeListener: RouteChangeListener;

export const TOOLKIT_LOADED_MESSAGE = 'ynab-toolkit-loaded';
export const TOOLKIT_BOOTSTRAP_MESSAGE = 'ynab-toolkit-bootstrap';

window.__toolkitUtils = {
  ...ynabUtils,
  ...emberUtils,
  ...Collections,
  observeListener: () => observeListener,
  routeChangeListener: () => routeChangeListener,
};

export class YNABToolkit {
  private featureInstances: Feature[] = [];

  public initializeToolkit() {
    window.addEventListener('message', this.onBackgroundMessage);
    window.postMessage({ type: OutboundMessageType.ToolkitLoaded }, '*');
  }

  private applyFeatureCSS() {
    $('head').append(
      $('<style>', { id: 'tk-global-styles', type: 'text/css' }).text(require('./ynab-toolkit.css'))
    );

    this.featureInstances.forEach((feature) => {
      if (isFeatureEnabled(feature.settings.enabled)) {
        this.injectFeatureCSS(feature);
      }
    });
  }

  private injectFeatureCSS(featureInstance: Feature) {
    const wrappedInjectCSS = withToolkitError(
      featureInstance.injectCSS.bind(featureInstance),
      featureInstance
    );

    const featureStyleID = `tk-feature-styles-${featureInstance.constructor.name}`;
    const featureCSS = wrappedInjectCSS();
    const featureStyle = $('<style>', {
      id: featureStyleID,
      type: 'text/css',
    }).text(featureCSS);

    if (featureCSS) {
      const existingStyle = document.querySelector(`#${featureStyleID}`);
      if (existingStyle) {
        $(existingStyle).replaceWith(featureStyle);
      } else {
        $('head').append(featureStyle);
      }
    }
  }

  private invokeFeature = (featureName: FeatureName, options?: { force: boolean }) => {
    const feature = this.featureInstances.find((f) => f.constructor.name === featureName);
    const wrappedShouldInvoke = feature.shouldInvoke.bind(feature);
    const wrappedInvoke = feature.invoke.bind(feature);
    const isEnabled = isFeatureEnabled(feature.settings.enabled);
    if ((isEnabled || (options && options.force)) && wrappedShouldInvoke()) {
      wrappedInvoke();
    }
  };

  private destroyFeature = (featureName: FeatureName) => {
    document.head.querySelector(`#tk-feature-styles-${featureName}`)?.remove();
    const feature = this.featureInstances.find((f) => f.constructor.name === featureName);
    feature.removeListeners();

    const wrappedDestroy = feature.destroy.bind(feature);
    wrappedDestroy();
  };

  private invokeFeatureInstances = async () => {
    this.featureInstances.forEach(async (feature) => {
      if (isFeatureEnabled(feature.settings.enabled)) {
        document.body.dataset[feature.constructor.name] = 'true';

        feature.applyListeners();

        try {
          await feature.willInvoke();
        } catch (exception) {
          const featureName = feature.constructor.name as FeatureName;
          const featureSetting = window.ynabToolKit.options[featureName];
          logToolkitError({
            exception,
            featureName,
            featureSetting,
            functionName: 'willInvoke',
          });
        }

        const wrappedShouldInvoke = withToolkitError(feature.shouldInvoke.bind(feature), feature);
        const wrappedInvoke = withToolkitError(feature.invoke.bind(feature), feature);
        if (wrappedShouldInvoke()) {
          wrappedInvoke();
        }
      }
    });
  };

  private onBackgroundMessage = (event: InboundMessage) => {
    if (event.source !== window) {
      return;
    }

    switch (event.data.type) {
      case InboundMessageType.Bootstrap: {
        window.ynabToolKit = {
          ...window.ynabToolKit,
          ...event.data.ynabToolKit,
        };

        this.setupErrorTracking();
        features.forEach((Feature) => this.featureInstances.push(new Feature()));
        this._waitForUserSettings();
        break;
      }
      case InboundMessageType.SettingChanged: {
        const { name, value } = event.data.setting;
        if (name === 'DisableToolkit' && value) {
          document.location.reload();
          break;
        }

        const featureInstance = this.featureInstances.find(
          ({ constructor }) => constructor.name === name
        );

        if (featureInstance) {
          featureInstance.settings.enabled = value;

          if (isFeatureEnabled(value)) {
            document.body.dataset[name] = 'true';
            this.injectFeatureCSS(featureInstance);
            featureInstance.applyListeners();
            this.invokeFeature(name);
          } else {
            delete document.body.dataset[name];
            this.destroyFeature(name);
          }
        }

        break;
      }
    }
  };

  private setupErrorTracking = () => {
    window.addEventListener('error', ({ error }) => {
      let serializedError = '';
      if (error.message && error.stack) {
        serializedError = `${error.message}\n${error.stack.toString()}`;
      } else if (error.message) {
        serializedError = error.message;
      }

      if (serializedError.includes(window.ynabToolKit.extensionId)) {
        logToolkitError({
          exception: error,
          featureName: 'unknown',
          featureSetting: 'unknown',
          functionName: 'global',
        });
      }
    });
  };

  private showReleaseModal = () => {
    componentAppend(
      <div id="tk-modal-container">
        <ToolkitReleaseModal
          onClose={() => document.querySelector('#tk-modal-container').remove()}
        />
      </div>,
      document.querySelector('.layout')
    );
  };

  private checkReleaseVersion = () => {
    const latestVersionKey = `latest-version-${ynabToolKit.environment}`;
    let latestVersion = getToolkitStorageKey(latestVersionKey);
    if (!latestVersion) {
      setToolkitStorageKey(latestVersionKey, ynabToolKit.version);
      return;
    }

    if (compareSemanticVersion(latestVersion, ynabToolKit.version) === -1) {
      setToolkitStorageKey(latestVersionKey, ynabToolKit.version);
      this.showReleaseModal();
    }
  };

  _waitForUserSettings() {
    const self = this;

    (function poll() {
      if (ynabUtils.isYNABReady()) {
        // add a global invokeFeature to the global ynabToolKit for legacy features
        // once legacy features have been removed, this should be a global exported function
        // from this file that features can require and use
        ynabToolKit.invokeFeature = self.invokeFeature;
        ynabToolKit.destroyFeature = self.destroyFeature;

        observeListener = new ObserveListener();
        routeChangeListener = new RouteChangeListener();

        // inject the global css from each feature into the HEAD of the DOM
        self.applyFeatureCSS();

        self.checkReleaseVersion();

        // Hook up listeners and then invoke any features that are ready to go.
        self.invokeFeatureInstances();
      } else if (typeof Ember !== 'undefined') {
        Ember.run.later(poll, 250);
      } else {
        setTimeout(poll, 250);
      }
    })();
  }
}
