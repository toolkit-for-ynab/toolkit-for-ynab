import { withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { getRouter } from 'toolkit/extension/utils/ember';
import { ynabRequire } from '../utils/ynab';

const { later, scheduleOnce } = ynabRequire('@ember/runloop');

export class RouteChangeListener {
  constructor() {
    const routeChangeListener = this;
    routeChangeListener.features = [];

    function emitSameBudgetRouteChange() {
      const currentRoute = getRouter().get('currentRouteName');
      routeChangeListener.features.forEach((feature) => {
        const observe = feature.onRouteChanged.bind(feature, currentRoute);
        const wrapped = withToolkitError(observe, feature);
        later(wrapped, 0);
      });
    }

    function emitBudgetRouteChange() {
      const currentRoute = getRouter().get('currentRouteName');
      routeChangeListener.features.forEach((feature) => {
        const observe = feature.onBudgetChanged.bind(feature, currentRoute);
        const wrapped = withToolkitError(observe, feature);
        later(wrapped, 0);
      });
    }

    getRouter().addObserver('currentState', ({ location, targetState: { routerJsState } }) => {
      if (routerJsState && routerJsState.params && routerJsState.params.index) {
        if (location.location.href.includes(routerJsState.params.index.budgetVersionId)) {
          scheduleOnce('afterRender', null, emitSameBudgetRouteChange);
        } else {
          scheduleOnce('afterRender', null, emitBudgetRouteChange);
          scheduleOnce('afterRender', null, emitSameBudgetRouteChange);
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
    this.features.removeAt(this.features.indexOf(feature));
  }
}
