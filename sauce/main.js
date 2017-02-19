import features from 'features';

const featureInstances = features.map(Feature => new Feature());

// This poll() function will only need to run until we find that the DOM is ready
(function poll() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined' &&
      typeof $ !== 'undefined' && $('.ember-view.layout').length &&
      typeof ynabToolKit !== 'undefined') {
    featureInstances.forEach((feature) => {
      feature.applyListeners();

      if (feature.settings.enabled && feature.shouldInvoke()) {
        feature.invoke();
      }
    });
  } else {
    setTimeout(poll, 250);
  }
}());
