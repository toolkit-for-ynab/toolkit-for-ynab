import { TransactionGridFeature } from '../feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class SwapClearedFlagged extends TransactionGridFeature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  insertHeader() {
    const headerRow = document.querySelector('.ynab-grid-header');
    if (headerRow) {
      swapColumns(headerRow);
    }
  }

  willInsertColumn() {
    if (this.element) {
      swapColumns(this.element);
    }
  }
}

function swapColumns(element) {
  const clearedColumn = element.querySelector('.ynab-grid-cell-cleared');
  const flagColumn = element.querySelector('.ynab-grid-cell-flag');
  if (
    !clearedColumn ||
    !flagColumn ||
    clearedColumn.classList.contains('tk-swapped') ||
    flagColumn.classList.contains('tk-swapped')
  ) {
    return;
  }

  const beforeClearedColumn = clearedColumn.previousElementSibling;
  const beforeFlagColumn = flagColumn.previousElementSibling;
  if (!beforeClearedColumn || !beforeFlagColumn) {
    return;
  }

  clearedColumn.classList.add('tk-swapped');
  flagColumn.classList.add('tk-swapped');

  beforeClearedColumn.after(flagColumn);
  beforeFlagColumn.after(clearedColumn);
}
