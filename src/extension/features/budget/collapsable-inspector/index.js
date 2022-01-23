import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class CollapsableInspector extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  destroy() {
    $('.tk-collapsible-inspector-button').remove();
    $('.budget-inspector').removeAttr('tk-collapse');
  }

  invoke() {
    this.addToolkitEmberHook('budget/budget-inspector', 'didRender', this.updateDOM);

    this.setInspectorCollapsed(getToolkitStorageKey('collapsable-inspector', false));
  }

  collapseButton() {
    return $(`
      <button class="sidebar-collapse">
        <svg height="32" width="32" class="ynab-new-icon ember-view">
          <use href="#icon_sprite_sidebar_expand"></use>
          <title>Collapse Inspector</title>    
        </svg>
      </button>
    `);
  }

  expandButton() {
    return $(`
      <button class="sidebar-expand">
        <svg height="32" width="32" class="ynab-new-icon ember-view">
          <use href="#icon_sprite_sidebar_collapse"></use>
          <title>Expand Inspector</title>    
        </svg>
      </button>
    `);
  }

  updateDOM() {
    if (!$('.budget-inspector').length) return;

    if (this.isInspectorCollapsed) {
      $('.budget-inspector').attr('tk-collapse', '');
    } else {
      $('.budget-inspector').removeAttr('tk-collapse');
    }

    let buttonContainer = $('.tk-collapsible-inspector-button');
    if (buttonContainer.length === 0) {
      buttonContainer = $(`<div class="tk-collapsible-inspector-button"></div>`);
      $('.budget-inspector-content').append(buttonContainer);
    }

    buttonContainer.empty();

    const button = this.isInspectorCollapsed ? this.expandButton() : this.collapseButton();
    buttonContainer.append(button);

    const self = this;
    button.on('click', function () {
      self.toggleInspectorCollapsed();
    });
  }

  setInspectorCollapsed(collapsed) {
    this.isInspectorCollapsed = collapsed;
    setToolkitStorageKey('collapsable-inspector', collapsed);

    this.updateDOM();
  }

  toggleInspectorCollapsed() {
    this.setInspectorCollapsed(!this.isInspectorCollapsed);
  }
}
