export const Ember = window.requireModule<{ default: Ember }>('ember').default;
export const __ynabapp__ = Ember.Namespace.NAMESPACES[0];

const viewCache = new Map();

export function getEmberView<T = EmberView>(viewId: string | undefined): T | null {
  function nodeMatcher(node: RenderTreeNode) {
    return node.instance?.elementId === viewId;
  }

  if (viewCache.has(viewId)) {
    return viewCache.get(viewId);
  }

  const view = findEmberDebugNodes(nodeMatcher, true)[0]?.instance ?? null;
  if (view) {
    viewCache.set(viewId, view);
  }

  return view;
}

// This function calculates the entire render tree of the application which means
// it's quite expensive to run. We should only call this on a need-to basis and
// we should make sure to cache our calls (similar to the above `getEmberView` call).
function findEmberDebugNodes(
  matcher: (node: RenderTreeNode) => boolean,
  findOne = false
): RenderTreeNode[] {
  const renderTree = Ember._captureRenderTree(__ynabapp__.__container__);
  const nodes: RenderTreeNode[] = [];
  findEmberDebugNodeHelper(renderTree[0], nodes, matcher, findOne);
  return nodes;
}

window.__toolkitUtils = { ...(window.__toolkitUtils as any), findEmberDebugNodes };

function findEmberDebugNodeHelper(
  node: RenderTreeNode,
  foundNodes: RenderTreeNode[],
  matcher: (node: RenderTreeNode) => boolean,
  findOne: boolean
): RenderTreeNode[] {
  if (matcher(node)) {
    foundNodes.push(node);
    if (findOne) {
      return foundNodes;
    }
  }

  if (node.children) {
    for (const childNode of node.children) {
      const found = findEmberDebugNodeHelper(childNode, foundNodes, matcher, findOne);
      if (findOne && found.length) {
        return found;
      }
    }
  }

  return foundNodes;
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
