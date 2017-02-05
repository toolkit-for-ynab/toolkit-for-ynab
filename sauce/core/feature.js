import { ObserveListener, RouteChangeListener } from 'core/listeners'

export default class Feature {
	constructor() {
    // set this.settings to this.constructor.names's settings
  }

  shouldInvoke() {
    throw Error(`Feature: ${this.constructor.name} does not implement required shouldInvoke() method.`)
  }

  invoke() {
    throw Error(`Feature: ${this.constructor.name} does not implement required invoke() method.`)
  }

  observe() { /* stubbed listener function */ }

  onRouteChanged() { /* stubbed listener function */ }

  applyListeners() {
    let observeListener = new ObserveListener();
    observeListener.addFeature(this);

    let routeChangeListener = new RouteChangeListener();
    routeChangeListener.addFeature(this);
  }
}
