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
    const modal = $('.modal', modalContainer);

    const subMenus = $('ul.modal-list li ul:not(.scrollable-edit-wrapper)', modal);
    subMenus.each((index, m) => {
      const menu = $(m);
      if (menu.parent().hasClass('scrollable-edit-wrapper')) return;

      const wrapper = $('<ul class="scrollable-edit-wrapper"></ul>');

      menu.after(wrapper);
      menu.appendTo(wrapper);

      const parent = wrapper.parent();
      parent.on('mouseover', function () {
        let top = parent.position().top - 15;
        if (top + wrapper.height() > modal.height()) {
          top = modal.height() - wrapper.height();
        }
        wrapper.css('top', top);
      });
    });

    if (modal.position().top + modal.outerHeight() > $(modalContainer).height()) {
      modal.height(Math.max($(modalContainer).height() - modal.position().top, 100));
    }
  }
}
