import { controllerLookup } from 'helpers/toolkit';

let instance = null;

export class RouteChangeListener {
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
        (controller, changedProperty) => {
          if (changedProperty === 'budgetVersionId') {
            Ember.run.scheduleOnce('afterRender', controller, 'emitBudgetRouteChange');
          } else {
            Ember.run.scheduleOnce('afterRender', controller, 'emitSameBudgetRouteChange');
          }
        }),

      emitSameBudgetRouteChange: function () {
        let currentRoute = applicationController.get('currentRouteName');
        routeChangeListener.features.forEach((feature) => {
          setTimeout(feature.onRouteChanged.bind(feature, currentRoute), 0);
        });
      },

      emitBudgetRouteChange: function () {
        let currentRoute = applicationController.get('currentRouteName');
        routeChangeListener.features.forEach((feature) => {
          setTimeout(feature.onBudgetChanged.bind(feature, currentRoute), 0);
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
