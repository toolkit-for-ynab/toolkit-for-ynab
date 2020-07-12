export function getEmberView(viewId, getterString) {
  const view = getViewRegistry()[viewId];
  if (getterString && view) {
    return view.get(getterString);
  }

  return view;
}

export function getRouter() {
  return containerLookup('router:main');
}

export function controllerLookup(controllerName) {
  return containerLookup(`controller:${controllerName}`);
}

export function componentLookup(componentName) {
  return containerLookup(`component:${componentName}`);
}

export function serviceLookup(serviceName) {
  return containerLookup(`service:${serviceName}`);
}

export function forEachRenderedComponent(key, fn) {
  return Object.values(getViewRegistry()).forEach(view => {
    if (view._debugContainerKey === `component:${key}`) {
      fn(view);
    }
  });
}

export function lookupForReopen(name) {
  const appContainer = __ynabapp__.__container__;

  let toReopen = appContainer.factoryCache[name];
  if (toReopen) {
    return toReopen;
  }

  // if it wasn't already cached, do a lookup which should cache it,
  // if this fails for some reason -- catch it an optimistically try
  // to resolve the cached version.
  try {
    appContainer.lookup(name);
  } catch (e) {
    /* not much we can do about it */
  }

  return appContainer.factoryCache[name];
}

/* Private Functions */
function containerLookup(containerName) {
  let container;
  try {
    container = __ynabapp__.__container__.lookup(containerName);
  } catch (e) {
    container = __ynabapp__.__container__.cache[containerName];
  }

  return container;
}

function getViewRegistry() {
  return __ynabapp__.__container__.lookup('-view-registry:main');
}
