import { controllerLookup } from 'toolkit/extension/utils/ember';
import { withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

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
            (function poll() {
              const applicationBudgetVersion = controllerLookup('application').get(
                'budgetVersionId'
              );
              const { activeBudgetVersion } = getEntityManager().getSharedLibInstance();
              if (
                activeBudgetVersion &&
                activeBudgetVersion.entityId &&
                activeBudgetVersion.entityId === applicationBudgetVersion
              ) {
                Ember.run.scheduleOnce('afterRender', controller, 'emitBudgetRouteChange');
              } else {
                Ember.run.next(poll, 250);
              }
            })();
          } else {
            Ember.run.scheduleOnce('afterRender', controller, 'emitSameBudgetRouteChange');
          }
        }
      ),

      emitSameBudgetRouteChange: function() {
        let currentRoute = applicationController.get('currentRouteName');
        routeChangeListener.features.forEach(feature => {
          const observe = feature.onRouteChanged.bind(feature, currentRoute);
          const wrapped = withToolkitError(observe, feature);
          Ember.run.later(wrapped, 0);
        });
      },

      emitBudgetRouteChange: function() {
        let currentRoute = applicationController.get('currentRouteName');
        routeChangeListener.features.forEach(feature => {
          const observe = feature.onBudgetChanged.bind(feature, currentRoute);
          const wrapped = withToolkitError(observe, feature);
          Ember.run.later(wrapped, 0);
        });
      },
    });

    instance = this;
  }

  addFeature(feature) {
    if (this.features.indexOf(feature) === -1) {
      this.features.push(feature);
    }
  }
}
