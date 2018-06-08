import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

const HIDEIMAGE = 'toolkit-modal-item-hide-image';
const BUTTONDISABLED = 'button-disabled';
const IMAGECLASSES = 'ember-view toolkit-menu-item toolkit-modal-item-hide-image flaticon stroke checkmark-1';

export class ResizeInspector extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    let width = getToolkitStorageKey('inspector-width');
    if (typeof width === 'undefined' || width === null) {
      width = 0;
    }

    this.setProperties(width);
    this.addResizeButton();
  }

  addResizeButton() {
    if (!$('#toolkitResizeInspector').length) {
      let buttonText = ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.InspectorWidth'] || 'Inspector Width';
      $('<button>', { id: 'toolkitResizeInspector', class: 'ember-view button', style: 'float: right' })
        .append($('<i>', { class: 'ember-view flaticon stroke gear-1' }))
        .append(' ' + buttonText)
        .click(() => {
          this.showResizeModal();
        })
        .insertAfter('.undo-redo-container');
    }
  }

  showResizeModal() {
    let _this = this;
    let btnLeft = $('.budget-toolbar').outerWidth() + $('#toolkitResizeInspector').outerWidth() + 29;
    let btnTop = $('.budget-toolbar').outerHeight() + $('.budget-header-flexbox').outerHeight() + 8;
    let $modal = $('<div>', { id: 'toolkitInspectorODiv', class: 'ember-view' })
      .append($('<div>', { id: 'toolkitInspectorModal', class: 'ynab-u modal-popup modal-resize-inspector ember-view modal-overlay active' })
        .append($('<div>', { id: 'toolkitInspectorIDiv', class: 'modal', style: 'left:' + btnLeft + 'px; top: ' + btnTop + 'px;' })
          .append($('<ul>', { class: 'modal-list' })
            .append($('<li>')
              .append($('<button>', { 'data-inspector-size': '0', class: 'button-list' })
                .click(function () {
                  _this.setProperties($(this).data('inspector-size'));
                })
                .append($('<i>', { class: IMAGECLASSES }))
                .append('Default ')))
            .append($('<li>')
              .append($('<button>', { 'data-inspector-size': '1', class: 'button-list' })
                .click(function () {
                  _this.setProperties($(this).data('inspector-size'));
                })
                .append($('<i>', { class: IMAGECLASSES }))
                .append('25% ')))
            .append($('<li>')
              .append($('<button>', { 'data-inspector-size': '2', class: 'button-list' })
                .click(function () {
                  _this.setProperties($(this).data('inspector-size'));
                })
                .append($('<i>', { class: IMAGECLASSES }))
                .append('20% ')))
            .append($('<li>')
              .append($('<button>', { 'data-inspector-size': '3', class: 'button-list' })
                .click(function () {
                  _this.setProperties($(this).data('inspector-size'));
                })
                .append($('<i>', { class: IMAGECLASSES }))
                .append('15% '))))
          .append($('<div>', { class: 'modal-arrow', style: 'position:absolute;width: 0;height: 0;bottom: 100%;left: 37px;border: solid transparent;border-color: transparent;border-width: 15px;border-bottom-color: #fff' }))));

    // Handle dismissal of modal via the ESC key
    $(document).one('keydown', (e) => {
      if (e.keyCode === 27) { // ESC key?
        $(document).off('click.toolkitResizeInspector');
        $('#toolkitInspectorODiv').remove();
      }
    });

    // Handle mouse clicks outside the drop-down modal. Namespace the
    // click event so we can remove our specific instance.
    $(document).on('click.toolkitResizeInspector', (e) => {
      if (e.target.id === 'toolkitInspectorModal') {
        $(document).off('click.toolkitResizeInspector');
        $('#toolkitInspectorODiv').remove();
      }
    });

    let width = getToolkitStorageKey('inspector-width');
    let btn = $modal.find('button[data-inspector-size="' + width + '"]');
    btn.prop('disabled', true);
    btn.addClass(BUTTONDISABLED);
    let img = $modal.find('button[data-inspector-size="' + width + '"] > i');
    img.removeClass(HIDEIMAGE);

    // Don't append until all the menu items have been set.
    $('.layout').append($modal);
  }

  setProperties(width) {
    let ele = '.budget-content';

    if (YNABFEATURES.get('categories-new-style') === undefined || YNABFEATURES.get('categories-new-style') === true) {
      ele = '.budget-table-container';
    }

    if ($(ele).length) {
      let contentWidth = '67%';
      let inspectorWidth = '33%';

      if (width === 1) {
        contentWidth = '75%';
        inspectorWidth = '25%';
      } else if (width === 2) {
        contentWidth = '80%';
        inspectorWidth = '20%';
      } else if (width === 3) {
        contentWidth = '85%';
        inspectorWidth = '15%';
      }

      $(ele)[0].style.setProperty('--toolkit-content-width', contentWidth);
      $('.budget-inspector')[0].style.setProperty('--toolkit-inspector-width', inspectorWidth);

      // Save the users current selection for future page loads.
      setToolkitStorageKey('inspector-width', width);

      // Remove our click event handler and the modal div.
      $(document).off('click.toolkitInspector');
      $('#toolkitInspectorODiv').remove();
    }
  }

  onBudgetChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
