import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const RESIZER_CLASS = 'tk-sidebar-resizer';
const WIDTH_CSS_VAR = '--tk-number-resize-sidebar-width-from-code';
const WIDTH_STORAGE_KEY = 'resize-sidebar-width';
const MIN_WIDTH = 200;
const MAX_WIDTH = 800;

export class ResizeSidebar extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  isMouseDown = false;

  shouldInvoke() {
    return true;
  }

  invoke() {
    const width = getToolkitStorageKey(WIDTH_STORAGE_KEY);
    this.updateProperty(width);
    this.addSidebarResizer();
  }

  addSidebarResizer() {
    const sidebar = $('nav.sidebar');

    // Build the resizer element
    const resizer = $('<div>', { class: RESIZER_CLASS });

    // Adds the resizer after the sidebar now
    $(sidebar).after(resizer);

    // Subscribe event on resizer to start resizing
    $(resizer)
      .click(event => event.stopPropagation())
      .mousedown(event => {
        this.toggleResize(true, event);
      });
  }

  onMouseMove(event) {
    if (!this.isMouseDown) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.updateProperty(event.clientX);
  }

  onMouseUp(event) {
    this.toggleResize(false, event);
    Ember.run.next(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  toggleResize(isMouseDown, event) {
    event.preventDefault();
    event.stopPropagation();
    this.isMouseDown = isMouseDown;

    // Bind or unbind the events based on if the mouse is down.
    // Use a local property so that unbinding works.
    if (isMouseDown) {
      $('body').on('mousemove', (this.bindOnMouseMove = this.onMouseMove.bind(this)));
      $('body').on('mouseup', (this.bindOnMouseUp = this.onMouseUp.bind(this)));
    } else {
      $('body').off('mousemove', this.bindOnMouseMove);
      $('body').off('mouseup', this.bindOnMouseUp);
    }
  }

  updateProperty(width) {
    if (typeof width !== 'number') {
      return;
    }

    // Keep the width between our defined borders
    const realWidth = Math.max(MIN_WIDTH, Math.min(width, MAX_WIDTH));

    $(':root')[0].style.setProperty(WIDTH_CSS_VAR, realWidth);
    setToolkitStorageKey(WIDTH_STORAGE_KEY, realWidth);
  }
}
