import { ObserveListener, RouteChangeListener } from 'toolkit/extension/listeners';
import { logToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';

export class Feature {
  featureName = this.constructor.name as FeatureName;

  settings = {
    enabled: ynabToolKit.options[this.featureName],
  };

  shouldInvoke() {
    // Default to no action. Unless you're implementing a CSS only feature,
    // you MUST override this to specify when your invoke() function should run!
    return false;
  }

  willInvoke() {
    /* stubbed optional hook for logic that must happen for a feature
    to work but doesn't need to happen on every invoke */
  }

  invoke() {
    throw Error(`Feature: ${this.featureName} does not implement required invoke() method.`);
  }

  injectCSS() {
    /* stubbed, default to no injected CSS */
  }

  logError(exception: Error) {
    logToolkitError({
      exception,
      featureName: this.featureName,
      featureSetting: this.settings.enabled,
    });
  }

  observe() {
    /* stubbed listener function */
  }

  onRouteChanged() {
    /* stubbed listener function */
  }

  onBudgetChanged() {
    /* stubbed listener function */
  }

  applyListeners() {
    let observeListener = new ObserveListener();
    observeListener.addFeature(this);

    let routeChangeListener = new RouteChangeListener();
    routeChangeListener.addFeature(this);
  }
}
