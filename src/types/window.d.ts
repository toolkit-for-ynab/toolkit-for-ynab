import Object from '@ember/object';
import Component from '@ember/component';
import { run } from '@ember/runloop';
import { Feature } from 'toolkit/extension/features/feature';

export interface YNABToolkitObject {
  assets: {
    logo: string;
  };
  environment: 'development' | 'beta' | 'production';
  extensionId: string;
  hookedComponents: Set<Feature>;
  invokeFeature(featureName: FeatureName, options?: { force: boolean }): void;
  destroyFeature(featureName: FeatureName): void;
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

  interface YNABTransactionViewModel {
    visibleTransactionDisplayItems: Transaction[];
  }

  interface YNABGlobal {
    YNABSharedLib: {
      dateFormatter: {
        formatDate(date: DateWithoutTime): string;
      };
      getBudgetViewModel_AllAccountsViewModel(): Promise<YNABTransactionViewModel>;
    };
  }

  type FeatureSetting = boolean | string;

  const Ember: Ember;
  const ynabToolKit: YNABToolkitObject;
  const ynab: YNABGlobal;
  const YNABFEATURES: any;
}
