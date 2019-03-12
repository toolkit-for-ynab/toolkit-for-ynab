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
    console.warn(
      "Second argument to withToolkitError should either be Feature Class or Feature Name as found in the feature's settings.js file"
    );
  }

  return function() {
    try {
      return wrappedFunction();
    } catch (exception) {
      logToolkitError({
        exception,
        featureName,
        featureSetting,
        functionName: wrappedFunction.name,
      });
    }
  };
}

/**
 * Logs an error to the console with extra context around the occurrence. Also sends a message to
 * the background script so it can inform Sentry of the error.
 * @param input Metadata describing the error that occurred
 * @param input.exception The exception that was thrown.
 * @param input.featureName The name of the feature that threw the error (if known).
 * @param input.featureSetting The user setting of the feature that threw the error (if known).
 * @param input.functionName The name of the function in the feature that threw the error (if known).
 */
export function logToolkitError({ exception, featureName, featureSetting, functionName }) {
  const routeName = window.location.pathname.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    'omitted'
  );
  let message = `Toolkit Error:
  - Feature: ${featureName}
  - Feature Setting: ${featureSetting}
  - Function: ${functionName || 'anonymous'}
  - Message: ${exception.message ? exception.message : 'none'}`;

  console.error(message, exception.stack ? exception.stack : '');

  const serializedError = exception.stack ? exception.stack.toString() : exception.message;
  window.postMessage(
    {
      type: 'ynab-toolkit-error',
      context: {
        featureName,
        featureSetting,
        functionName,
        routeName,
        serializedError,
      },
    },
    '*'
  );
}
