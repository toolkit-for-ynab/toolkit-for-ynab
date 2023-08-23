import * as React from 'react';
import { features } from 'toolkit/extension/features';
import * as ynabUtils from 'toolkit/extension/utils/ynab';
import * as emberUtils from 'toolkit/extension/utils/ember';
import * as Collections from 'toolkit/extension/utils/collections';
import { isFeatureEnabled } from 'toolkit/extension/utils/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { logToolkitError, withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { Ember, forEachRenderedComponent } from './utils/ember';
import { compareSemanticVersion } from './utils/helpers';
import { componentAppend } from './utils/react';
import { ToolkitReleaseModal } from 'toolkit/core/components/toolkit-release-modal';
import { Feature } from './features/feature';
import { InboundMessage, InboundMessageType, OutboundMessageType } from 'toolkit/core/messages';
import { ObserveListener, RouteChangeListener } from './listeners';
const { later } = ynabUtils.ynabRequire('@ember/runloop');

export let observeListener: ObserveListener;
export let routeChangeListener: RouteChangeListener;

export const TOOLKIT_LOADED_MESSAGE = 'ynab-toolkit-loaded';
export const TOOLKIT_BOOTSTRAP_MESSAGE = 'ynab-toolkit-bootstrap';

export type SupportedEmberHook = 'didRender' | 'didInsertElement' | 'didUpdate';

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
    if (!feature) {
      console.error(`Feature not found: ${featureName}`);
      return;
    }

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
    if (!feature) {
      console.error(`Feature not found: ${featureName}`);
      return;
    }

    feature.removeListeners();
    feature.removeToolkitEmberHooks();

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
          hookedComponents: new Set(),
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
      if (error?.message && error?.stack) {
        serializedError = `${error.message}\n${error.stack.toString()}`;
      } else if (error?.message) {
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

  private addToolkitEmberHooks = () => {
    EMBER_COMPONENT_TOOLKIT_HOOKS.forEach((lifecycleName) => {
      Ember.Component.prototype[lifecycleName] = function () {
        const self = this;
        const hooks = self[emberComponentToolkitHookKey(lifecycleName)];
        if (hooks) {
          hooks.forEach(({ context, fn, guard }) => {
            if (guard && !guard(self.element as HTMLElement)) {
              return;
            }

            fn.call(context, self.element as HTMLElement);
          });
        }
      };
    });
  };

  private invokeAllHooks = () => {
    window.ynabToolKit.hookedComponents.forEach((key) => {
      forEachRenderedComponent(key, (view) => {
        EMBER_COMPONENT_TOOLKIT_HOOKS.forEach((lifecycleName) => {
          const hooks = (view as any as EmberComponent)[
            emberComponentToolkitHookKey(lifecycleName)
          ];
          if (hooks) {
            hooks.forEach((hook) => {
              if (hook.guard && !hook.guard(view.element)) {
                return;
              }

              hook.fn.call(hook.context, view.element);
            });
          }
        });
      });
    });
  };

  private showReleaseModal = () => {
    componentAppend(
      <div id="tk-modal-container">
        <ToolkitReleaseModal
          onClose={() => document.querySelector('#tk-modal-container')?.remove()}
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
        // YNAB does some lazy execution of their code (it's already loaded so I'm not really sure what the)
        // goal is with it. But if you load YNAB on the budget page, then some object (like transaction
        // grid row components) won't be available. This then causes some deferred errors to happen. When we
        // look up these templates at launch, all that code executes and wa-la!
        emberUtils.containerLookup('template:accounts');
        emberUtils.containerLookup('template:budget');
        emberUtils.containerLookup('template:reports');

        // add a global invokeFeature to the global ynabToolKit for legacy features
        // once legacy features have been removed, this should be a global exported function
        // from this file that features can require and use
        window.ynabToolKit.invokeFeature = self.invokeFeature;
        window.ynabToolKit.destroyFeature = self.destroyFeature;

        self.addToolkitEmberHooks();

        observeListener = new ObserveListener();
        routeChangeListener = new RouteChangeListener();

        // inject the global css from each feature into the HEAD of the DOM
        self.applyFeatureCSS();

        self.checkReleaseVersion();

        // Hook up listeners and then invoke any features that are ready to go.
        self.invokeFeatureInstances();

        later(self.invokeAllHooks, 100);
      } else {
        setTimeout(poll, 250);
      }
    })();
  }
}
