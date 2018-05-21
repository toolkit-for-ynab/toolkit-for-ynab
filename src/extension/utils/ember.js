export function getEmberView(viewId) {
  return getViewRegistry()[viewId];
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
  } catch (e) { /* not much we can do about it */ }

  return appContainer.factoryCache[name];
}

/* Private Functions */
function containerLookup(containerName) {
  const viewRegistry = getViewRegistry();
  const viewId = Ember.keys(viewRegistry)[0];
  const view = viewRegistry[viewId];

  let container;
  try {
    container = view.container.lookup(containerName);
  } catch (e) {
    container = view.container.factoryCache[containerName];
  }

  return container;
}

function getViewRegistry() {
  return Ember.Component.create().get('_viewRegistry');
}
