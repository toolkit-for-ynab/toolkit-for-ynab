import { Feature } from 'toolkit/extension/features/feature';

export function withToolkitError(wrappedFunction: Function, feature: Feature | FeatureName) {
  if (typeof wrappedFunction !== 'function') {
    throw new Error('The first argument to withToolkitError must be a Function');
  }

  const featureName = typeof feature === 'string' ? feature : feature.featureName;
  const featureSetting = ynabToolKit.options[featureName];
  if (typeof featureSetting === 'undefined') {
    console.warn(
      "Second argument to withToolkitError should either be Feature Class or Feature Name as found in the feature's settings.js file"
    );
  }

  return function () {
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
 */
interface LogToolkitErrorInput {
  exception: unknown;
  featureName: FeatureName | 'unknown';
  featureSetting: boolean | string;
  functionName?: string;
}

export function logToolkitError({
  exception,
  featureName,
  featureSetting,
  functionName,
}: LogToolkitErrorInput) {
  const errorMessage = exception instanceof Error ? exception.message : 'none';
  const errorStack = exception instanceof Error ? exception.stack : '';

  const routeName = window.location.pathname.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    'omitted'
  );
  let message = `Toolkit Error:
  - Feature: ${featureName}
  - Feature Setting: ${featureSetting}
  - Function: ${functionName || 'anonymous'}
  - Message: ${errorMessage}`;

  console.error(message, errorStack || '');

  const serializedError = errorStack ? errorStack.toString() : errorMessage;
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
