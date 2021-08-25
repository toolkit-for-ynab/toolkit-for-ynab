import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

const HEADER_CLASS = 'tk-resizable-column';

// If another feature alters header classes, add the class names here
const IGNORE_CLASSES = [HEADER_CLASS];

// Amount to increase/decrease flex-grow/flex-shrink per click
const GROW_STEP = 0.01;

const IGNORE_COLUMNS = [
  'budget-table-cell-checkbox',
  'budget-table-cell-collapse',
  'budget-table-cell-margin',
  'budget-table-cell-name',
];

export class ResizableColumns extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  injectCSS() {
    return require('./index.css');
  }

  loadColumnSize(columnClass) {
    return getToolkitStorageKey(`resizable-columns-${columnClass}`, 0);
  }

  saveColumnSize(columnClass, size) {
    setToolkitStorageKey(`resizable-columns-${columnClass}`, size);
  }

  getColumnClass(columnHeader) {
    let columnClass = columnHeader.attr('class');

    let split = columnClass.split(' ');
    IGNORE_CLASSES.forEach((ignoreClass) => {
      split = split.filter((className) => className !== ignoreClass);
    });
    columnClass = split.join('.');

    return columnClass;
  }

  getColumnSize(columnHeader) {
    return parseFloat(columnHeader.css('flex-grow')) || 0;
  }

  setColumnSize(columnClass, size) {
    const cells = $(`.${columnClass}`);
    cells.css('flex-grow', size);
  }

  preventContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  changeColumnSize(e) {
    e.preventDefault();
    e.stopPropagation();

    const self = e.data;

    // Some header elements have sub-elements - try going up one level
    let columnHeader = $(e.target);
    if (!columnHeader.hasClass(HEADER_CLASS)) columnHeader = columnHeader.parent();
    if (!columnHeader.hasClass(HEADER_CLASS)) return;

    // Find the column class - e.g. budget-table-cell-available, to find all cells in the column
    const columnClass = self.getColumnClass(columnHeader);
    if (!columnClass) return;

    let step = 0;
    if (e.button === 0) step = GROW_STEP; // Left click
    if (e.button === 2) step = -GROW_STEP; // Right click

    let size = Math.max(self.getColumnSize(columnHeader) + step, 0);
    if (e.button === 1) size = 0; // Middle click

    self.setColumnSize(columnClass, size);
    self.saveColumnSize(columnClass, size);
  }

  // Check to see if any new columns have been added by other features
  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    if (changedNodes.has('budget-table-header-labels')) {
      this.invoke();
    }
  }

  invoke() {
    let columns = $('.budget-table-header-labels li');
    IGNORE_COLUMNS.forEach((ignoreClass) => {
      columns = columns.filter(`:not(.${ignoreClass})`);
    });

    columns.each((index, colEl) => {
      const col = $(colEl);
      if (!col.hasClass(HEADER_CLASS)) {
        col.on('click', this, this.changeColumnSize);
        col.on('auxclick', this, this.changeColumnSize);
        col.on('contextmenu', this, this.preventContextMenu);

        const columnClass = this.getColumnClass(col);
        const size = this.loadColumnSize(columnClass);
        this.setColumnSize(columnClass, size);

        col.addClass(HEADER_CLASS);
      }
    });
  }

  destroy() {
    const columnHeaders = $(`.${HEADER_CLASS}`);
    columnHeaders.off('click', this.changeColumnSize);
    columnHeaders.off('auxclick', this.changeColumnSize);
    columnHeaders.off('contextmenu', this.preventContextMenu);

    columnHeaders.each((id, el) => {
      const columnClass = this.getColumnClass($(el));
      this.setColumnSize(columnClass, 0);
    });

    columnHeaders.removeClass(HEADER_CLASS);
  }
}
