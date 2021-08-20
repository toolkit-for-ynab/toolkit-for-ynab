import Component from '@ember/component';
import { run } from '@ember/runloop';
import { settingsMap } from 'toolkit/core/settings';
import { SupportedEmberHook } from 'toolkit/extension/ynab-toolkit';

export interface YNABToolkitObject {
  assets: {
    logo: string;
  };
  environment: 'development' | 'beta' | 'production';
  extensionId: string;
  featureComponentHooks: {
    [featureName: string]: {
      [componentKey: string]: Set<SupportedEmberHook>;
    };
  };
  hookedComponents: {
    [componentKey: string]: Set<SupportedEmberHook>;
  };
  invokeFeature(featureName: FeatureName): void;
  options: {
    [settingName in FeatureName]: FeatureSetting;
  };
  name: string;
  version: string;
}

declare global {
  interface Window {
    Ember: Ember;
    __toolkitUtils: any;
    ynabToolKit: YNABToolkitObject;
  }

  interface Ember {
    run: typeof run;
    Component: Component & {
      prototype: {
        didReceiveAttrs: Component['didReceiveAttrs'];
        didRender: Component['didRender'];
        didUpdate: Component['didUpdate'];
        didUpdateAttrs: Component['didUpdateAttrs'];
        willRender: Component['willRender'];
        willUpdate: Component['willUpdate'];

        didInsertElement(): void;
      };
    };
  }

  type FeatureName = keyof typeof settingsMap;
  type FeatureSetting = boolean | string;

  const Ember: Ember;
  const ynabToolKit: YNABToolkitObject;
}
