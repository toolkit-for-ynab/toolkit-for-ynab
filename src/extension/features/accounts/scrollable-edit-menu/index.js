import { Feature } from 'toolkit/extension/features/feature';
import { Ember } from 'toolkit/extension/utils/ember';

export class ScrollableEditMenu extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  observe(changedNodes) {
    if (
      changedNodes.has('modal-overlay active ynab-u modal-popup modal-account-register-action-bar')
    ) {
      const element = document.querySelector('.modal-account-register-action-bar');
      this.addScrollWrappers(element);
    }
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
      document.querySelector('.modal-account-register-action-bar')
    );
    view.isScrolledIfOverflowedOutOfWindow = true;
    view.makeScrollableIfOverflowed = this.overrideMSIO;
    $('.modal-list', modalContainer).addClass('js-ynab-modal-scrollable-area');

    const modal = $('.modal', modalContainer);

    const subMenus = $('ul.modal-list li > ul:not(.scrollable-edit-wrapper)', modal);
    subMenus.each((index, m) => {
      const menu = $(m);
      if (menu.parent().hasClass('scrollable-edit-wrapper')) return;

      const wrapper = $('<ul class="scrollable-edit-wrapper"></ul>');

      menu.after(wrapper);
      menu.appendTo(wrapper);
    });

    $('ul.modal-list li > ul', modal).each((index, el) => {
      const ul = $(el);
      const li = ul.parent();

      const windowMargin = 10;
      li.on('mouseenter', function () {
        let top = li.offset().top;
        let height = ul.height();
        if (top + height > $(window).height() - windowMargin) {
          top = Math.max(windowMargin, $(window).height() - height - windowMargin);
        }
        if (top + height > $(window).height() - windowMargin) {
          height = $(window).height() - windowMargin - top;
          ul.children().css('overflow', 'auto');
        }
        top -= li.offset().top - li.position().top;
        ul.css({
          top: top,
          height: height,
        });
      });
    });
  }
}
