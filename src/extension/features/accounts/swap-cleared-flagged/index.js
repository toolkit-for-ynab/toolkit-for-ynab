import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class SwapClearedFlagged extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    let flags = $('.ynab-grid-cell-flag');
    let cleared = $('.ynab-grid-cell-cleared');

    for (var i = 0; i < flags.length; i += 1) {
      // If not swapped
      if (this.getChildNumber(cleared[i]) - this.getChildNumber(flags[i]) > 0) {
        this.swapElements(flags[i], cleared[i]);
      }
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }

  swapElements(elm1, elm2) {
    let parent1 = elm1.parentNode;
    let next1 = elm1.nextSibling;
    let parent2 = elm2.parentNode;
    let next2 = elm2.nextSibling;

    parent1.insertBefore(elm2, next1);
    parent2.insertBefore(elm1, next2);
  }

  getChildNumber(node) {
    return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
  }
}
