import { Feature } from 'core/feature';
import {
  getCurrentRouteName,
  getToolkitStorageKey,
  removeToolkitStorageKey,
  setToolkitStorageKey
} from 'helpers/toolkit';

// these must be in the order that they appear on the page
const RESIZABLES = [
  'ynab-grid-cell-date',
  'ynab-grid-cell-accountName',
  'ynab-grid-cell-payeeName',
  'ynab-grid-cell-subCategoryName',
  'ynab-grid-cell-memo',
  'ynab-grid-cell-outflow',
  'ynab-grid-cell-inflow',
  'ynab-grid-cell-toolkit-running-balance'
];

export class AdjustableColumnWidths extends Feature {
  injectCSS() { return require('./index.css'); }

  constructor() {
    super();
    this.elementWasDragged = false;
    this.isMouseDown = false;
    this.currentX = null;
  }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('account') !== -1;
  }

  onMouseMove(event) {
    if (!this.isMouseDown) { return; }

    event.preventDefault();
    event.stopPropagation();

    Ember.run.debounce(this, () => {
      if (this.offTarget && !event.target.classList.contains('toolkit-draggable')) {
        return;
      }

      this.offTarget = false;
      const invertedDifference = this.currentX - event.clientX;
      const difference = invertedDifference * -1;

      const { isNeighborResizable, neighborCellName } = this.getNeighborOf(this.currentResizableClass);

      if (!isNeighborResizable) {
        return;
      }

      const $elementsOfTypeNeighbor = $(`.${neighborCellName}`);
      const neighborWidth = $elementsOfTypeNeighbor.width();
      const newNeighborWidth = neighborWidth - difference;

      const $elementsOfTypeCurrentResizable = $(`.${this.currentResizableClass}`);
      const currentResizableWidth = $elementsOfTypeCurrentResizable.width();
      const newCurrentResizableWidth = currentResizableWidth + difference;

      if (newNeighborWidth < 50 || newCurrentResizableWidth < 50) {
        this.offTarget = true;
        return;
      }

      this.currentX = event.clientX;
      $elementsOfTypeCurrentResizable.width(newCurrentResizableWidth);
      setToolkitStorageKey(`column-width-${this.currentResizableClass}`, newCurrentResizableWidth);

      $elementsOfTypeNeighbor.width(newNeighborWidth);
      setToolkitStorageKey(`column-width-${neighborCellName}`, newNeighborWidth);
    }, 100);
  }

  onMouseUp() {
    $('body').off('mousemove', this.bindOnMouseMove);
    $('body').off('mouseup', this.bindOnMouseUp);

    if (this.isMouseDown) {
      this.isMouseDown = false;
      this.elementWasDragged = true;
    }
  }

  getNeighborOf(neighborOf) {
    const $rightNeighbor = $(`.${neighborOf}`, '.ynab-grid-header').next();

    if (!$rightNeighbor.length) {
      return { isNeighborResizable: false };
    }

    const neighborCellName = $rightNeighbor.prop('class').match(/ynab-grid-cell.*/)[0];
    return {
      neighborCellName,
      isNeighborResizable: RESIZABLES.some((className) => className === neighborCellName)
    };
  }

  resetWidths() {
    RESIZABLES.forEach((resizableClass) => {
      $(`.${resizableClass}`).width('');
      removeToolkitStorageKey(`column-width-${resizableClass}`);
    });
  }

  invoke() {
    if (!$('.toolkit-reset-widths').length) {
      $('<button class="toolkit-reset-widths button">Reset Column Widths</button>')
        .click(this.resetWidths)
        .insertAfter($('.accounts-toolbar-all-dates', '.accounts-toolbar-right'));
    }

    RESIZABLES.forEach((resizableClass) => {
      const width = getToolkitStorageKey(`column-width-${resizableClass}`, 'number');
      if (width) {
        $(`.${resizableClass}`).width(width);
      }

      if (!this.getNeighborOf(resizableClass).isNeighborResizable) {
        return;
      }

      $(`.${resizableClass}`, '.ynab-grid-header')
        .click((event) => {
          if (this.elementWasDragged) {
            event.preventDefault();
            event.stopPropagation();
            this.elementWasDragged = false;
          }
        })
        .css({ position: 'relative' })
        .append(
          $('<div class="toolkit-draggable"></div>')
            .click((event) => event.stopPropagation())
            .mousedown((event) => {
              console.log('mousedown', resizableClass);
              this.isMouseDown = true;
              this.currentX = event.clientX;
              this.currentResizableClass = resizableClass;

              this.bindOnMouseMove = this.onMouseMove.bind(this);
              this.bindOnMouseUp = this.onMouseUp.bind(this);
              $('body').on('mousemove', this.bindOnMouseMove);
              $('body').on('mouseup', this.bindOnMouseUp);
            })
          );
    });
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) { return; }
    this.invoke();
  }
}
