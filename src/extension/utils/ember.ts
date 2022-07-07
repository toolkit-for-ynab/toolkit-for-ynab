export function getEmberView(viewId: string) {
  return getViewRegistry()[viewId];
}

export function getRouter() {
  return containerLookup<YNABRouter>('router:main');
}

export function controllerLookup<T extends unknown>(controllerName: string) {
  return containerLookup<T>(`controller:${controllerName}`);
}

export function componentLookup<T extends unknown>(componentName: string) {
  return containerLookup<T>(`component:${componentName}`);
}

export function serviceLookup<T extends unknown>(serviceName: string) {
  return containerLookup<T>(`service:${serviceName}`);
}

export function factoryLookup<T extends unknown>(componentName: string) {
  return __ynabapp__?.__container__?.factoryFor<T>(`component:${componentName}`);
}

export function forEachRenderedComponent(key: string, fn: (view: EmberView) => void) {
  Object.values(getViewRegistry()).forEach((view) => {
    if (view?._debugContainerKey === `component:${key}`) {
      fn(view);
    }
  });
}

export function containerLookup<T>(containerName: string) {
  let container: T | undefined;
  try {
    container = __ynabapp__.__container__.lookup<T>(containerName);
  } catch (e) {
    container = __ynabapp__.__container__.cache[containerName] as T;
  }

  return container;
}

export function getViewRegistry() {
  return __ynabapp__.__container__.lookup<EmberViewRegistry>('-view-registry:main') ?? {};
}
