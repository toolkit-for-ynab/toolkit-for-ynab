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
  }

  invoke() {
    this.addToolkitEmberHook('budget/budget-inspector', 'didRender', this.insertButton);

    this.setInspectorCollapse(getToolkitStorageKey('inspector-collapse', false));
  }

  insertButton() {
    if ($('.tk-collapsible-inspector-button').length) {
      return;
    }

    $('.budget-inspector-content').append(
      $(`
      <div class="tk-collapsible-inspector-button">
        <button class="sidebar-collapse">
          <svg height="32" width="32" class="ynab-new-icon ember-view">
            <use href="#icon_sprite_sidebar_collapse"></use>
            <title>Collapse Inspector</title>    
          </svg>
        </button>
      </div>
      `)
    );

    const self = this;
    $('.tk-collapsible-inspector-button button').on('click', function () {
      self.toggleInspectorCollapse();
    });
  }

  getInspectorCollapse() {
    return $('.budget-inspector').attr('tk-collapse') != null;
  }

  setInspectorCollapse(collapse) {
    if (collapse) {
      $('.budget-inspector').attr('tk-collapse', '');
    } else {
      $('.budget-inspector').removeAttr('tk-collapse');
    }

    setToolkitStorageKey('inspector-collapse', collapse);
  }

  toggleInspectorCollapse() {
    this.setInspectorCollapse(!this.getInspectorCollapse());
  }
}
