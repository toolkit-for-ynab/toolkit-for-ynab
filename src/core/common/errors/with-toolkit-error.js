export function withToolkitError(wrappedFunction, feature) {
  if (typeof wrappedFunction !== 'function') {
    throw new Error('The first argument to withToolkitError must be a Function');
  }

  let featureName = feature;
  if (typeof feature === 'object') {
    featureName = feature.constructor.name;
  }

  const featureSetting = ynabToolKit.options[featureName];
  if (typeof featureSetting === 'undefined') {
    console.warn("Second argument to withToolkitError should either be Feature Class or Feature Name as found in the feature's settings.js file");
  }

  return function () {
    try {
      return wrappedFunction();
    } catch (exception) {
      logToolkitError(exception, featureName, wrappedFunction.name, featureSetting);
    }
  };
}

export function logToolkitError(exception, featureName, location, featureSetting) {
  let message = `Toolkit Error:
    - Feature: ${featureName}
    - Location: ${location || 'anonymous'}
    - User Setting: ${featureSetting}
    - Message: ${exception.message ? exception.message : 'none'}`;

  console.error(message, exception.stack ? exception.stack : '');
}
