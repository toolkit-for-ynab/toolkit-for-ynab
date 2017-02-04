export function controllerLookup(controllerName) {
  return containerLookup(`controller:${controllerName}`);
}

export function scheduleOnce(onEvent, handler) {
  Ember.run.scheduleOnce(onEvent, handler);
}

export function getEmberView(viewId) {
  return getViewRegistry()[viewId];
}

function getViewRegistry() {
  return Ember.Component.create().get('_viewRegistry');
}

function containerLookup(containerName) {
  let viewRegistry = getViewRegistry();
  let viewId = Ember.keys(viewRegistry)[0];
  let view = viewRegistry[viewId];
  return view.container.lookup(containerName);
}
