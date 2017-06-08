import { ObserveListener, RouteChangeListener } from 'core/listeners';

export default class Feature {
  constructor() {
    this.settings = {
      enabled: ynabToolKit.options[this.constructor.name]
    };
  }

  shouldInvoke() {
    // Default to no action. Unless you're implementing a CSS only feature,
    // you MUST override this to specify when your invoke() function should run!
    return false;
  }

  invoke() {
    throw Error(`Feature: ${this.constructor.name} does not implement required invoke() method.`);
  }

  injectCSS() { /* stubbed, default to no injected CSS */ }

  observe() { /* stubbed listener function */ }

  onRouteChanged() { /* stubbed listener function */ }

  onBudgetChanged() { /* stubbed listener function */ }

  applyListeners() {
    let observeListener = new ObserveListener();
    observeListener.addFeature(this);

    let routeChangeListener = new RouteChangeListener();
    routeChangeListener.addFeature(this);
  }
}
