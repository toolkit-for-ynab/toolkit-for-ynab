import Component from '@ember/component';
import type { YNABApp } from '../window';
import { RenderTreeNode } from './ember-view';

interface EmberComponentPrototype {
  element: Element;

  didReceiveAttrs: Component['didReceiveAttrs'];
  didRender: Component['didRender'];
  didUpdate: Component['didUpdate'];
  didUpdateAttrs: Component['didUpdateAttrs'];
  willRender: Component['willRender'];
  willUpdate: Component['willUpdate'];
  didInsertElement(): void;
}

export interface EmberComponent extends Component, EmberComponentPrototype {
  class: {
    prototype: EmberComponentPrototype;
  };
  prototype: EmberComponentPrototype;
}

export interface Ember {
  _captureRenderTree(app: YNABApp['__container__']): RenderTreeNode[];
  Component: EmberComponent;
  Namespace: {
    NAMESPACES: [YNABApp];
  };
}
