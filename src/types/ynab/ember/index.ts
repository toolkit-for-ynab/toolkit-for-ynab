import Component from '@ember/component';
import { run } from '@ember/runloop';
import { Feature } from 'toolkit/extension/features/feature';
import type { YNABApp } from '../window';
import { RenderTreeNode } from './ember-view';

interface ToolkitEmberHook {
  context: Feature;
  fn(element: HTMLElement): void;
  guard?: (element: HTMLElement) => boolean;
}

interface EmberComponentPrototype {
  element: Element;

  didReceiveAttrs: Component['didReceiveAttrs'];
  didRender: Component['didRender'];
  didUpdate: Component['didUpdate'];
  didUpdateAttrs: Component['didUpdateAttrs'];
  willRender: Component['willRender'];
  willUpdate: Component['willUpdate'];
  didInsertElement(): void;

  _tk_didRender_hooks_?: ToolkitEmberHook[];
  _tk_didInsertElement_hooks_?: ToolkitEmberHook[];
  _tk_didUpdate_hooks_?: ToolkitEmberHook[];
}

export interface EmberComponent extends Component, EmberComponentPrototype {
  class: {
    prototype: EmberComponentPrototype;
  };
  prototype: EmberComponentPrototype;
}

export interface Ember {
  _captureRenderTree(app: YNABApp['__container__']): RenderTreeNode[];
  run: typeof run;
  Component: EmberComponent;
  Namespace: {
    NAMESPACES: [YNABApp];
  };
}
