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

  overrideMSIO() {
    const modal = $('.modal', this.element);
    const scrollable = $('.js-ynab-modal-scrollable-area', this.element);
    if (modal && scrollable) {
      const arrowDir = this.get('arrow');
      const windowHeight = $(window).height();
      const windowMargin = this.get('windowMargin');
      const targetY = this.triggerElement.offset().top;

      let top = this.get('modalY');
      let height = modal.height();
      if (arrowDir === 'down') {
        if (top < this.windowMargin) {
          height -= windowMargin - top;
          top = windowMargin;
        }
        if (top + height > targetY) {
          height -= targetY - (top + height);
        }
        scrollable.css({
          overflow: 'auto',
          height: '100%',
        });
        modal.css({
          top: top,
          height: height,
        });
      } else if (arrowDir === 'up') {
        if (top + height > windowHeight - windowMargin) {
          height -= top + height + windowMargin - windowHeight;
        }
        scrollable.css({
          overflow: 'auto',
          height: '100%',
        });
        modal.css({
          height: height,
        });
      } else {
        scrollable.css({
          overflow: 'visible',
        });
        modal.css({
          height: 'auto',
        });
      }
    }
  }

  addScrollWrappers(modalContainer) {
    const view = Ember.ViewUtils.getElementView(
      document.querySelector('.modal-account-edit-transaction-list')
    );
    view.isScrolledIfOverflowedOutOfWindow = true;
    view.makeScrollableIfOverflowed = this.overrideMSIO;
    $('.modal-list', modalContainer).addClass('js-ynab-modal-scrollable-area');

    const modal = $('.modal', modalContainer);

    const subMenus = $('ul.modal-list > li > ul:not(.scrollable-edit-wrapper)', modal);
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
  }
}
