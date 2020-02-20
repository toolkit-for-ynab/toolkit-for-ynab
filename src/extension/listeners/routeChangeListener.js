import { controllerLookup } from 'toolkit/extension/utils/ember';
import { withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { getRouter } from 'toolkit/extension/utils/ember';

let instance = null;

export class RouteChangeListener {
  constructor() {
    if (instance) {
      return instance;
    }

    const routeChangeListener = this;
    routeChangeListener.features = [];

    function emitSameBudgetRouteChange() {
      const applicationController = controllerLookup('application');
      const currentRoute = applicationController.get('currentRouteName');
      routeChangeListener.features.forEach(feature => {
        const observe = feature.onRouteChanged.bind(feature, currentRoute);
        const wrapped = withToolkitError(observe, feature);
        Ember.run.later(wrapped, 0);
      });
    }

    function emitBudgetRouteChange() {
      const applicationController = controllerLookup('application');
      const currentRoute = applicationController.get('currentRouteName');
      routeChangeListener.features.forEach(feature => {
        const observe = feature.onBudgetChanged.bind(feature, currentRoute);
        const wrapped = withToolkitError(observe, feature);
        Ember.run.later(wrapped, 0);
      });
    }

    getRouter().addObserver('currentState', ({ location, targetState: { routerJsState } }) => {
      if (routerJsState && routerJsState.params && routerJsState.params.index) {
        if (location.location.href.includes(routerJsState.params.index.budgetVersionId)) {
          Ember.run.scheduleOnce('afterRender', null, emitSameBudgetRouteChange);
        } else {
          Ember.run.scheduleOnce('afterRender', null, emitBudgetRouteChange);
          Ember.run.scheduleOnce('afterRender', null, emitSameBudgetRouteChange);
        }
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
