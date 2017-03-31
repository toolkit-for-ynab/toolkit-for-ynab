import { ObserveListener, RouteChangeListener } from 'core/listeners';

export default class Feature {
  constructor() {
    this.settings = {
      enabled: ynabToolKit.options[this.constructor.name]
    };
  }

  shouldInvoke() {
    throw Error(`Feature: ${this.constructor.name} does not implement required shouldInvoke() method.`);
  }

  invoke() {
    throw Error(`Feature: ${this.constructor.name} does not implement required invoke() method.`);
  }

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
