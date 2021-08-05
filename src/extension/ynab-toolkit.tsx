import * as React from 'react';
import { features } from 'toolkit/extension/features';
import * as ynabUtils from 'toolkit/extension/utils/ynab';
import * as emberUtils from 'toolkit/extension/utils/ember';
import * as Collections from 'toolkit/extension/utils/collections';
import { isFeatureEnabled } from 'toolkit/extension/utils/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { logToolkitError, withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { forEachRenderedComponent } from './utils/ember';
import { compareSemanticVersion } from './utils/helpers';
import { componentAppend } from './utils/react';
import { ToolkitReleaseModal } from 'toolkit/core/components/toolkit-release-modal';
import { Feature } from './features/feature';

let hasToolkitLoaded = false;
export const TOOLKIT_LOADED_MESSAGE = 'ynab-toolkit-loaded';
export const TOOLKIT_BOOTSTRAP_MESSAGE = 'ynab-toolkit-bootstrap';

type SupportedEmberHook = 'didRender' | 'didInsertElement' | 'didUpdate';

export const EMBER_COMPONENT_TOOLKIT_HOOKS: SupportedEmberHook[] = [
  'didRender',
  'didInsertElement',
  'didUpdate',
];
export const emberComponentToolkitHookKey = (
  hookName: SupportedEmberHook
): `_tk_${SupportedEmberHook}_hooks_` => `_tk_${hookName}_hooks_`;

window.__toolkitUtils = {
  ...ynabUtils,
  ...emberUtils,
  ...Collections,
};

interface ToolkitEmberHook {
  context: Feature;
  fn(element: Element): void;
}

type ToolkitEnabledComponent = Ember['Component'] & {
  element?: Element;
  _tk_didRender_hooks_?: ToolkitEmberHook[];
  _tk_didInsertElement_hooks_?: ToolkitEmberHook[];
  _tk_didUpdate_hooks_?: ToolkitEmberHook[];
};

export class YNABToolkit {
  _featureInstances: Feature[] = [];

  initializeToolkit() {
    window.addEventListener('message', this._onBackgroundMessage);
    window.postMessage({ type: TOOLKIT_LOADED_MESSAGE }, '*');
  }

  _applyFeatureCSS() {
    $('head').append(
      $('<style>', { id: 'tk-global-styles', type: 'text/css' }).text(require('./ynab-toolkit.css'))
    );

    this._featureInstances.forEach((feature) => {
      if (isFeatureEnabled(feature.settings.enabled)) {
        this._injectFeatureCSS(feature);
      }
    });
  }

  _injectFeatureCSS(featureInstance: Feature) {
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

  _createFeatureInstances() {
    features.forEach((Feature) => {
      this._featureInstances.push(new Feature());
    });
  }

  _invokeFeature = (featureName: FeatureName) => {
    const feature = this._featureInstances.find((f) => f.constructor.name === featureName);
    const wrappedShouldInvoke = feature.shouldInvoke.bind(feature);
    const wrappedInvoke = feature.invoke.bind(feature);
    if (isFeatureEnabled(feature.settings.enabled) && wrappedShouldInvoke()) {
      wrappedInvoke();
    }
  };

  _destroyFeature = (featureName: FeatureName) => {
    document.head.querySelector(`#tk-feature-styles-${featureName}`)?.remove();

    const feature = this._featureInstances.find((f) => f.constructor.name === featureName);
    const wrappedDestroy = feature.destroy.bind(feature);
    wrappedDestroy();
  };

  _invokeFeatureInstances = async () => {
    this._featureInstances.forEach(async (feature) => {
      if (isFeatureEnabled(feature.settings.enabled)) {
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

  _onBackgroundMessage = (event: MessageEvent) => {
    if (event.source !== window) {
      return;
    }

    switch (event.data.type) {
      case TOOLKIT_BOOTSTRAP_MESSAGE: {
        window.ynabToolKit = {
          ...window.ynabToolKit,
          ...event.data.ynabToolKit,
          hookedComponents: new Set(),
        };

        this._setupErrorTracking();
        this._createFeatureInstances();
        this._waitForUserSettings();
        break;
      }
      case 'ynab-toolkit-setting-changed': {
        const { name, value } = event.data.setting;
        if (name === 'DisableToolkit') {
          if (!value && !hasToolkitLoaded) {
            $('head').append(
              $('<style>', { id: 'tk-global-styles', type: 'text/css' }).text(
                require('./ynab-toolkit.css')
              )
            );

            this._checkReleaseVersion();
          } else if (value) {
            $('#tk-global-styles').remove();
          }

          this._featureInstances.forEach((feature) => {
            if (value) {
              this._destroyFeature(feature.constructor.name);
            } else if (isFeatureEnabled(feature.settings.enabled)) {
              this._injectFeatureCSS(feature);
              this._invokeFeature(feature.constructor.name);
            }
          });

          return;
        }

        const featureInstance = this._featureInstances.find(
          ({ constructor }) => constructor.name === name
        );

        if (featureInstance) {
          featureInstance.settings.enabled = value;

          if (isFeatureEnabled(value)) {
            this._injectFeatureCSS(featureInstance);
            this._invokeFeature(name);
          } else {
            this._destroyFeature(name);
          }
        }

        break;
      }
    }
  };

  _removeMessageListener() {
    window.removeEventListener('message', this._onBackgroundMessage);
  }

  _setupErrorTracking = () => {
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

  _addToolkitEmberHooks = () => {
    EMBER_COMPONENT_TOOLKIT_HOOKS.forEach((lifecycleName) => {
      Ember.Component.prototype[lifecycleName] = function () {
        const self = this as ToolkitEnabledComponent;
        const hooks = self[emberComponentToolkitHookKey(lifecycleName)];
        if (hooks) {
          hooks.forEach(({ context, fn }) => fn.call(context, self.element));
        }
      };
    });
  };

  _invokeAllHooks = () => {
    window.ynabToolKit.hookedComponents.forEach((key) => {
      forEachRenderedComponent(key, (view: ToolkitEnabledComponent) => {
        EMBER_COMPONENT_TOOLKIT_HOOKS.forEach((lifecycleName) => {
          const hooks = view[emberComponentToolkitHookKey(lifecycleName)];
          if (hooks) {
            hooks.forEach((hook) => hook.fn.call(hook.context, view.element));
          }
        });
      });
    });
  };

  _showNewReleaseModal = () => {
    componentAppend(
      <div id="tk-modal-container">
        <ToolkitReleaseModal
          onClose={() => document.querySelector('#tk-modal-container').remove()}
        />
      </div>,
      document.querySelector('.layout')
    );
  };

  _checkReleaseVersion = () => {
    const latestVersionKey = `latest-version-${ynabToolKit.environment}`;
    let latestVersion = getToolkitStorageKey(latestVersionKey);
    if (!latestVersion) {
      setToolkitStorageKey(latestVersionKey, ynabToolKit.version);
      return;
    }

    if (compareSemanticVersion(latestVersion, ynabToolKit.version) === -1) {
      setToolkitStorageKey(latestVersionKey, ynabToolKit.version);
      this._showNewReleaseModal();
    }
  };

  _waitForUserSettings() {
    const self = this;

    (function poll() {
      if (ynabUtils.isYNABReady()) {
        // add a global invokeFeature to the global ynabToolKit for legacy features
        // once legacy features have been removed, this should be a global exported function
        // from this file that features can require and use
        ynabToolKit.invokeFeature = self._invokeFeature;

        self._addToolkitEmberHooks();

        if (!ynabToolKit.options['DisableToolkit']) {
          // inject the global css from each feature into the HEAD of the DOM
          self._applyFeatureCSS();

          self._checkReleaseVersion();

          // Hook up listeners and then invoke any features that are ready to go.
          self._invokeFeatureInstances();

          Ember.run.later(self._invokeAllHooks, 100);

          hasToolkitLoaded = true;
        }
      } else if (typeof Ember !== 'undefined') {
        Ember.run.later(poll, 250);
      } else {
        setTimeout(poll, 250);
      }
    })();
  }
}
