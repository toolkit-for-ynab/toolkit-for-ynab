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

  changeColumnSize(e, step) {
    e.preventDefault();
    e.stopPropagation();

    let button = $(e.target);

    let columnHeader = button.parent();
    if (!columnHeader.hasClass(HEADER_CLASS)) columnHeader = columnHeader.parent();
    if (!columnHeader.hasClass(HEADER_CLASS)) return;

    // Find the column class - e.g. budget-table-cell-available, to find all cells in the column
    const columnClass = this.getColumnClass(columnHeader);
    if (!columnClass) return;

    let size = Math.max(this.getColumnSize(columnHeader) + GROW_STEP * step, 0);
    if (step === 0) size = 0;

    this.setColumnSize(columnClass, size);
    this.saveColumnSize(columnClass, size);
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
        const plus = $('<button class="tk-resizable-column-plus" title="">+</button>');
        const minus = $('<button class="tk-resizable-column-minus" title="">-</button>');

        plus.on('click', (e) => this.changeColumnSize(e, 1));
        minus.on('click', (e) => this.changeColumnSize(e, -1));
        plus.on('contextmenu', (e) => this.changeColumnSize(e, 0));
        minus.on('contextmenu', (e) => this.changeColumnSize(e, 0));

        col.append(plus, minus);
        col.addClass(HEADER_CLASS);
      }
    });
  }

  destroy() {
    $('.tk-resizable-column-plus').remove();
    $('.tk-resizable-column-minus').remove();

    const columnHeaders = $(`.${HEADER_CLASS}`);
    columnHeaders.each((id, el) => {
      const columnClass = this.getColumnClass($(el));
      this.setColumnSize(columnClass, 0);
    });
    columnHeaders.removeClass(HEADER_CLASS);
  }
}
