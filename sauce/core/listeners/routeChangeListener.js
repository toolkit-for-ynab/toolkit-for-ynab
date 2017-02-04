import { controllerLookup, scheduleOnce } from 'helpers/toolkit';

let instance = null;

export default class RouteChangeListener {
  constructor() {
    if (instance) {
      return instance;
    }

    let routeChangeListener = this;
    routeChangeListener.features = [];

    let applicationController = controllerLookup('application');
    applicationController.reopen({
      onRouteChanged: Ember.observer(
        'currentRouteName', // this will handle accounts -> budget and vise versa
        'budgetVersionId', // this will handle changing budgets
        'selectedAccountId', // this will handle switching around accounts
        'monthString', // this will handle changing which month of a budget you're looking at
        (controller, changed) => {
          Ember.run.scheduleOnce('afterRender', controller, 'emitChanges');
      }),

      emitChanges: function () {
        let currentRoute = applicationController.get('currentRouteName');
        routeChangeListener.features.forEach((feature) => {
          setTimeout(feature.onRouteChanged.bind(feature, currentRoute), 0)
        });
      }
    });

    instance = this;
  }

  addFeature(feature) {
    if (this.features.indexOf(feature) === -1) {
      this.features.push(feature);
    }
  }
}
