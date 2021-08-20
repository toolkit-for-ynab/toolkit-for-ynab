import { Feature } from 'toolkit/extension/features/feature';

export class SwapClearedFlagged extends Feature {
  shouldInvoke() {
    return true;
  }

  injectCSS() {
    return require('./index.css');
  }

  invoke() {
    const rows = [
      'register/grid-header',
      'register/grid-sub',
      'register/grid-row',
      'register/grid-scheduled',
      'register/grid-scheduled-sub',
      'register/grid-actions',
      'register/grid-pending',
      'register/grid-split',
      'register/grid-edit',
    ];

    this.addToolkitEmberHook('register/grid-header', 'didRender', this.swapColumns);

    rows.forEach((key) => {
      this.addToolkitEmberHook(key, 'didInsertElement', this.swapColumns);
    });
  }

  destroy() {
    const header = document.querySelector('.ynab-grid-header-row');
    if (header) {
      this.swapColumns(header);
    }

    for (const element of document.querySelectorAll('.ynab-grid-body-row')) {
      this.swapColumns(element);
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
