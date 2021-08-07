import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class ScrollableEditMenu extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    addToolkitEmberHook(
      this,
      'modals/register/edit-transactions',
      'didRender',
      this.addScrollWrappers
    );
  }

  destroy() {}

  addScrollWrappers(modalContainer) {
    const subMenus = $('ul.modal-list li ul:not(.scrollable-edit-wrapper)', modalContainer);
    subMenus.each((index, m) => {
      const menu = $(m);
      if (menu.parent().hasClass('scrollable-edit-wrapper')) return;

      const wrapper = $('<ul class="scrollable-edit-wrapper"></ul>');

      menu.after(wrapper);
      menu.appendTo(wrapper);

      const parent = wrapper.parent();
      parent.on('mouseover', function () {
        wrapper.css('top', parent.position().top - 15);
      });
    });

    const modal = $('.modal', modalContainer);
    if (modal.position().top + modal.outerHeight() > $(modalContainer).height()) {
      modal.height($(modalContainer).height() - modal.position().top);
    }
  }
}
