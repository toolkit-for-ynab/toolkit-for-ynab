import { ObserveListener, RouteChangeListener } from 'core/listeners'

export default class Feature {
	constructor() {
    // set this.settings to this.constructor.names's settings
  }

  invoke() {
    throw Error(`Feature: ${this.constructor.name} does not implement invoke() method.`)
  }

  observe() {
    console.log('Feature Class');
  }

  onRouteChanged() {
    console.log('Feature Class');
  }

  applyListeners() {
    let observeListener = new ObserveListener();
    observeListener.addFeature(this);

    let routeChangeListener = new RouteChangeListener();
    routeChangeListener.addFeature(this);
  }
}
