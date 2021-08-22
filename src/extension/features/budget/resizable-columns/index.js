import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

const IGNORE_COLUMNS = [
  'budget-table-cell-checkbox',
  'budget-table-cell-collapse',
  'budget-table-cell-margin',
  'budget-table-cell-name',
];

const GROW_STEP = 0.1;

export class ResizableColumns extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  injectCSS() {
    return require('./index.css');
  }

  getFlexSize(column) {
    let colClass;
    column.classList.forEach((className) => {
      if (className !== 'tk-resizable-column') colClass = className;
    });
    if (!colClass) return;

    const allCols = $(`.${colClass}`);

    let grow = parseFloat($(column).css('flex-grow'));
    if (!grow) grow = 0;

    return {
      class: colClass,
      elements: allCols,
      grow: grow,
    };
  }

  loadColumnSize(className) {
    return getToolkitStorageKey(`resizable-columns-${className}`, 0);
  }

  saveColumnSize(className, grow) {
    setToolkitStorageKey(`resizable-columns-${className}`, grow);
  }

  expandColumn(e, column) {
    e.preventDefault();
    e.stopPropagation();

    const size = this.getFlexSize(column);
    if (!size) return;

    size.elements.css('flex-grow', size.grow + GROW_STEP);

    this.saveColumnSize(size.class, size.grow + GROW_STEP);
  }

  shrinkColumn(e, column) {
    e.preventDefault();
    e.stopPropagation();

    const size = this.getFlexSize(column);
    if (!size) return;

    size.elements.css('flex-grow', size.grow - GROW_STEP);

    this.saveColumnSize(size.class, size.grow - GROW_STEP);
  }

  invoke() {
    let columns = $('.budget-table-header-labels li');
    IGNORE_COLUMNS.forEach((ignoreClass) => {
      columns = columns.filter(`:not(.${ignoreClass})`);
    });

    columns.each((index, colEl) => {
      const col = $(colEl);
      if (!col.hasClass('tk-resizable-column')) {
        col.on('click', (e) => this.expandColumn(e, e.target));
        col.on('contextmenu', (e) => this.shrinkColumn(e, e.target));

        // If the header text is encased in an element, add handlers for that too
        col.children().each((id, el) => {
          const child = $(el);
          child.on('click', (e) => this.expandColumn(e, e.target.parentElement));
          child.on('contextmenu', (e) => this.shrinkColumn(e, e.target.parentElement));
        });

        const grow = this.loadColumnSize(colEl.className);
        col.css('flex-grow', grow);

        col.addClass('tk-resizable-column');
      }
    });
  }
}
