import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
/* global $, console, require */

const resizerClass = 'sidebar-resizer';
const widthCssVar = '--tk-number-resize-sidebar-width-from-code';
const widthStorageKey = 'resize-sidebar-width';
const mindWidth = 200;
const maxWidth = 800;

export class ResizeSidebar extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  isMouseDown = false;

  shouldInvoke() { return true; }

  invoke() {
    const width = getToolkitStorageKey(widthStorageKey);
    this.updateProperty(width);
    this.addSidebarResizer();
  }

  addSidebarResizer() {
    const sidebar = $('nav.sidebar');

    // Build the resizer element
    const resizer = $('<div>', { class: resizerClass });

    // Adds the resizer after the sidebar now
    $(sidebar).after(resizer);

    // Subscribe event on resizer to start resizing
    $(resizer).click((event) => event.stopPropagation())
      .mousedown((event) => {
        this.toggleResize(true, event);
      });
  }

  onMouseMove(event) {
    if (!this.isMouseDown) { return; }

    event.preventDefault();
    event.stopPropagation();

    this.updateProperty(event.clientX);
  }

  onMouseUp(event) {
    this.toggleResize(false, event);
  }

  toggleResize(isMouseDown, event) {
    event.preventDefault();
    event.stopPropagation();
    this.isMouseDown = isMouseDown;

    // Bind or unbind the events based on if the mouse is down.
    // Use a local property so that unbinding works.
    if (isMouseDown) {
      $('body').on('mousemove', this.bindOnMouseMove = this.onMouseMove.bind(this));
      $('body').on('mouseup', this.bindOnMouseUp = this.onMouseUp.bind(this));
    } else {
      $('body').off('mousemove', this.bindOnMouseMove);
      $('body').off('mouseup', this.bindOnMouseUp);
    }
  }

  updateProperty(width) {
    if (typeof width !== 'number') { return; }

    // Keep the width between our defined borders
    width = Math.max(mindWidth, Math.min(width, maxWidth));

    $(':root')[0].style.setProperty(widthCssVar, width);
    setToolkitStorageKey(widthStorageKey, width);
  }
}
