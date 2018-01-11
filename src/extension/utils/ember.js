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

/* Private Functions */
function getViewRegistry() {
  return Ember.Component.create().get('_viewRegistry');
}

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
