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
  Object.values(getViewRegistry()).forEach((view) => {
    if (view._debugContainerKey === `component:${key}`) {
      fn(view);
    }
  });
}

export function containerLookup(containerName) {
  let container;
  try {
    container = __ynabapp__.__container__.lookup(containerName);
  } catch (e) {
    container = __ynabapp__.__container__.cache[containerName];
  }

  return container;
}

export function getViewRegistry() {
  return __ynabapp__.__container__.lookup('-view-registry:main');
}
