import features from 'toolkit/features';

const featureInstances = features.map(Feature => new Feature());

function isYNABReady() {
  return (
    typeof Em !== 'undefined' &&
    typeof Ember !== 'undefined' &&
    typeof $ !== 'undefined' &&
    $('.ember-view.layout').length &&
    typeof ynabToolKit !== 'undefined'
  );
}

// Check if the passed feature is enabled.
function isFeatureEnabled(feature) {
  return (
    (typeof feature.settings.enabled === 'boolean' && feature.settings.enabled) ||
    (typeof feature.settings.enabled === 'string' && feature.settings.enabled !== '0') // assumes '0' means disabled
  );
}

// This poll() function will only need to run until we find that the DOM is ready
(function poll() {
  if (isYNABReady()) {
    // Gather any desired global CSS from features
    let globalCSS = '';

    featureInstances.forEach(feature => {
      if (isFeatureEnabled(feature) && feature.injectCSS()) {
        globalCSS += `/* == Injected CSS from feature: ${feature.constructor.name} == */\n\n${feature.injectCSS()}\n`;
      }
    });

    ynabToolKit.invokeFeature = (featureName) => {
      const feature = featureInstances.find((f) => f.constructor.name === featureName);
      if (isFeatureEnabled(feature) && feature.shouldInvoke()) {
        feature.invoke();
      }
    };

    // Inject it into the head so it's left alone
    $('head').append(
      $('<style>', { id: 'toolkit-injected-styles', type: 'text/css' })
        .text(globalCSS)
    );

    // Hook up listeners and then invoke any features that are ready to go.
    featureInstances.forEach((feature) => {
      if (isFeatureEnabled(feature)) {
        feature.applyListeners();

        const willInvokeRetValue = feature.willInvoke();

        if (willInvokeRetValue && typeof willInvokeRetValue.then === 'function') {
          willInvokeRetValue.then(() => {
            if (feature.shouldInvoke()) {
              feature.invoke();
            }
          });
        } else {
          if (feature.shouldInvoke()) {
            feature.invoke();
          }
        }
      }
    });
  } else {
    setTimeout(poll, 250);
  }
}());
