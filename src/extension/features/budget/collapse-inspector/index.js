import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class CollapseInspector extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  destroy() {
    $('.tk-collapse-inspector').remove();
    $('.budget-inspector').removeAttr('tk-collapse-inspector');
  }

  invoke() {
    this.setInspectorCollapsed(getToolkitStorageKey('collapse-inspector', false));
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('budget-inspector')) {
      this.updateDOM();
    }
  }

  collapseButton() {
    return $(`
      <button class="sidebar-collapse" type="button">
        <svg height="12" width="12" class="ynab-new-icon ember-view">
          <use href="#icon_sprite_sidebar_open"></use>
          <title>Collapse Inspector</title>    
        </svg>
      </button>
    `);
  }

  expandButton() {
    return $(`
      <button class="sidebar-expand" type="button">
        <svg height="12" width="12" class="ynab-new-icon ember-view">
          <use href="#icon_sprite_sidebar_close"></use>
          <title>Expand Inspector</title>    
        </svg>
      </button>
    `);
  }

  updateDOM() {
    if (!$('.budget-inspector').length) return;

    if (this.isInspectorCollapsed) {
      $('.budget-inspector').attr('tk-collapse-inspector', '');
    } else {
      $('.budget-inspector').removeAttr('tk-collapse-inspector');
    }

    let buttonContainer = $('.tk-collapse-inspector');
    if (buttonContainer.length === 0) {
      buttonContainer = $(`<div class="tk-collapse-inspector"></div>`);
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
    setToolkitStorageKey('collapse-inspector', collapsed);

    this.updateDOM();
  }

  toggleInspectorCollapsed() {
    this.setInspectorCollapsed(!this.isInspectorCollapsed);
  }
}
