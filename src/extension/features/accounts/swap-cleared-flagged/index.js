import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

export class SwapClearedFlagged extends Feature {
  shouldInvoke() {
    return true;
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

    addToolkitEmberHook(this, 'register/grid-header', 'didRender', swapColumns);

    rows.forEach(key => {
      addToolkitEmberHook(this, key, 'didInsertElement', swapColumns);
    });
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
