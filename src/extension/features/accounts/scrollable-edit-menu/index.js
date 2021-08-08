import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

function calcPosition(target, parent) {
  if (parent === 0) parent = null;
  const offsetParent = parent == null ? null : parent.offsetParent();
  const pos = target.position();
  const offset = target.offset();
  const i =
    (offsetParent == null ? null : offsetParent.css('position')) === 'absolute' ? pos : offset;
  const el = target.get(0);
  let left = i.left;
  let top = i.top;
  let outerWidth = target.outerWidth();
  let outerHeight = target.outerHeight();
  if (!el.getClientRects().length) {
    let boundingRect = el.getBoundingClientRect();
    let defaultView = el.ownerDocument.defaultView;
    left = boundingRect.left + defaultView.pageXOffset;
    top = boundingRect.top + defaultView.pageYOffset;
    outerWidth = boundingRect.width;
    outerHeight = boundingRect.height;
  }
  return {
    x: left,
    y: top,
    width: outerWidth,
    height: outerHeight,
    offsetX: offset.left,
    offsetY: offset.top,
  };
}

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
      const sizePos = calcPosition(modal, this.immediateParent());
      const modalY = this.get('modalY');
      const modalBottom = sizePos.y + scrollable.prop('scrollHeight');
      const windowHeight = $(window).height();
      if (arrowDir === 'up' && modalBottom > windowHeight) {
        const height = windowHeight - sizePos.y;
        scrollable.css({
          overflow: 'auto',
          height: '100%',
        });
        modal.css({
          height: height,
        });
      } else if (arrowDir === 'down' && modalY < 0) {
        const height = sizePos.height - Math.abs(modalY) - 10;
        scrollable.css({
          overflow: 'auto',
          height: '100%',
        });
        modal.css({
          top: 10,
          height: height,
        });
      } else if (arrowDir === 'down' && modalBottom > this.triggerElement.position().top) {
        const height = this.triggerElement.position().top - 24; // todo: replace constant
        scrollable.css({
          overflow: 'auto',
          height: '100%',
        });
        modal.css({
          top: 10,
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
