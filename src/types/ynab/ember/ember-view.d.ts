interface EmberView {
  elementId: string;
  element: HTMLElement;
  parentViewChildViews?: EmberView[];
  _debugContainerKey: boolean | string;
}

interface EmberViewRegistry {
  [emberId: string]: EmberView | undefined;
}

interface RenderTreeNode {
  children: RenderTreeNode[];
  type: string;
  name: string;
  args: {
    named: Record<string, any>;
    positional: any[];
  };
  bounds: {
    firstNode?: HTMLElement;
    lastNode?: HTMLElement;
    parentElement?: HTMLElement;
  };
  instance?: any;
}
