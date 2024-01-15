import { Feature } from 'toolkit/extension/features/feature';

export class SwapClearedFlagged extends Feature {
  shouldInvoke() {
    return true;
  }

  injectCSS() {
    return require('./index.css');
  }

  invoke() {
    const header = document.querySelector('.ynab-grid-header-row');
    if (header) {
      this.swapColumns(header);
    }

    for (const element of document.querySelectorAll('.ynab-grid-body-row')) {
      this.swapColumns(element);
    }
  }

  destroy() {
    this.invoke();
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  swapColumns(element) {
    const clearedColumn = element.querySelector('.ynab-grid-cell-cleared');
    const flagColumn = element.querySelector('.ynab-grid-cell-flag');
    if (!clearedColumn || !flagColumn) {
      return;
    }

    const clearedIndex = Array.from(clearedColumn.parentElement.children).indexOf(clearedColumn);
    const flagIndex = Array.from(flagColumn.parentElement.children).indexOf(flagColumn);
    const isSwapped = clearedIndex < flagIndex;
    if ((this.settings.enabled && !isSwapped) || (!this.settings.enabled && isSwapped)) {
      const $tmp = $('<div>');
      $(clearedColumn).after($tmp);
      $(flagColumn).after($(clearedColumn));
      $tmp.after($(flagColumn));
      $tmp.remove();
    }
  }
}
