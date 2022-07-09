interface EmberView {
  element: HTMLElement;
  _debugContainerKey: boolean | string;

  get(key: keyof EmberView): EmberView[];
}

interface EmberViewRegistry {
  [emberId: string]: EmberView | undefined;
}
