import { withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { getRouter } from 'toolkit/extension/utils/ember';

export class RouteChangeListener {
  constructor() {
    const routeChangeListener = this;
    routeChangeListener.features = [];

    function emitSameBudgetRouteChange() {
      const currentRoute = getRouter().currentRouteName;
      routeChangeListener.features.forEach((feature) => {
        const observe = feature.onRouteChanged.bind(feature, currentRoute);
        const wrapped = withToolkitError(observe, feature);
        setTimeout(wrapped, 0);
      });
    }

    function emitBudgetRouteChange() {
      const currentRoute = getRouter().currentRouteName;
      routeChangeListener.features.forEach((feature) => {
        const observe = feature.onBudgetChanged.bind(feature, currentRoute);
        const wrapped = withToolkitError(observe, feature);
        setTimeout(wrapped, 0);
      });
    }

    getRouter().addObserver('currentState', ({ location, targetState: { routerJsState } }) => {
      if (routerJsState && routerJsState.params && routerJsState.params.index) {
        if (location.location.href.includes(routerJsState.params.index.budgetVersionId)) {
          setTimeout(emitSameBudgetRouteChange, 0);
        } else {
          setTimeout(emitBudgetRouteChange, 0);
          setTimeout(emitSameBudgetRouteChange, 0);
        }
      }
    });
  }

  addFeature(feature) {
    if (this.features.indexOf(feature) === -1) {
      this.features.push(feature);
    }
  }

  removeFeature(feature) {
    this.features.splice(this.features.indexOf(feature), 1);
  }
}
