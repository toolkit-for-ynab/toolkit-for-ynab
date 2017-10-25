import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

const HIDEIMAGE = 'toolkit-modal-item-hide-image';
const BUTTONDISABLED = 'button-disabled';

export class ResizeInspector extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1 &&
           this.settings.enabled;
  }

  invoke() {
    let width = toolkitHelper.getToolkitStorageKey('inspector-width', 'number');
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
        .append(buttonText + ' ')
        .append($('<i>', { class: 'ember-view flaticon stroke down' }))
        .click(() => {
          this.showResizeModal();
        })
        .insertAfter('.undo-redo-container');
    }
  }

  showResizeModal() {
    let _this = this;
    let btnLeft = $('.budget-toolbar').outerWidth() + $('#toolkitResizeInspector').outerWidth() + 24;
    let btnTop = $('.budget-toolbar').outerHeight() + $('.budget-header-flexbox').outerHeight() + 8;
    let $modal = $('<div id=toolkitInspectorODiv class="ember-view">' +
                    '<div id="toolkitInspectorModal" class="ynab-u modal-popup modal-resize-inspector ember-view modal-overlay active">' +
                     '<div id=toolkitInspectorIDiv class="modal" style="left: ' + btnLeft + 'px; top: ' + btnTop + 'px;">' +
                      '<ul class="modal-list">' +
                        '<li><button id="toolkitInspector00Btn" class="button-list"><i id=toolkitInspector00Img class="ember-view flaticon stroke checkmark-1"/>Default</button></li>' +
                        '<li><button id="toolkitInspector25Btn" class="button-list"><i id=toolkitInspector25Img class="ember-view flaticon stroke checkmark-1"/>25%</button></li>' +
                        '<li><button id="toolkitInspector20Btn" class="button-list"><i id=toolkitInspector20Img class="ember-view flaticon stroke checkmark-1"/>20%</button></li>' +
                        '<li><button id="toolkitInspector15Btn" class="button-list"><i id=toolkitInspector15Img class="ember-view flaticon stroke checkmark-1"/>15%</button></li>' +
                      '</ul>' +
                      '<div class="modal-arrow" style="position:absolute;width: 0;height: 0;bottom: 100%;left: 37px;border: solid transparent;border-color: transparent;border-width: 15px;border-bottom-color: #fff"></div>' +
                     '</div>' +
                    '</div>' +
                   '</div>');

    let $00img = $modal.find('#toolkitInspector00Img');
    let $00btn = $modal.find('#toolkitInspector00Btn');
    $00btn.click(() => {
      _this.setProperties(0);
    });

    let $25img = $modal.find('#toolkitInspector25Img');
    let $25btn = $modal.find('#toolkitInspector25Btn');
    $25btn.click(() => {
      _this.setProperties(1);
    });

    let $20img = $modal.find('#toolkitInspector20Img');
    let $20btn = $modal.find('#toolkitInspector20Btn');
    $20btn.click(() => {
      _this.setProperties(2);
    });

    let $15img = $modal.find('#toolkitInspector15Img');
    let $15btn = $modal.find('#toolkitInspector15Btn');
    $15btn.click(() => {
      _this.setProperties(3);
    });

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

    let width = toolkitHelper.getToolkitStorageKey('inspector-width', 'number');

    // Determine which menu item is disabled (current width) and which
    // items are enabled. The current width will display a checkmark
    // while the other menu items will display nothing.
    switch (width) { // current inspector width!
      case 0:
        $00btn.prop('disabled', true);
        $00btn.addClass(BUTTONDISABLED);
        $00img.removeClass(HIDEIMAGE);

        $25btn.prop('disabled', false);
        $25btn.removeClass(BUTTONDISABLED);
        $25img.addClass(HIDEIMAGE);

        $20btn.prop('disabled', false);
        $20btn.removeClass(BUTTONDISABLED);
        $20img.addClass(HIDEIMAGE);

        $15btn.prop('disabled', false);
        $15btn.removeClass(BUTTONDISABLED);
        $15img.addClass(HIDEIMAGE);

        break;
      case 1:
        $00btn.prop('disabled', false);
        $00btn.removeClass(BUTTONDISABLED);
        $00img.addClass(HIDEIMAGE);

        $25btn.prop('disabled', true);
        $25btn.addClass(BUTTONDISABLED);
        $25img.removeClass(HIDEIMAGE);

        $20btn.prop('disabled', false);
        $20btn.removeClass(BUTTONDISABLED);
        $20img.addClass(HIDEIMAGE);

        $15btn.prop('disabled', false);
        $15btn.removeClass(BUTTONDISABLED);
        $15img.addClass(HIDEIMAGE);

        break;
      case 2:
        $00btn.prop('disabled', false);
        $00btn.removeClass(BUTTONDISABLED);
        $00img.addClass(HIDEIMAGE);

        $25btn.prop('disabled', false);
        $25btn.removeClass(BUTTONDISABLED);
        $25img.addClass(HIDEIMAGE);

        $20btn.prop('disabled', true);
        $20btn.addClass(BUTTONDISABLED);
        $20img.removeClass(HIDEIMAGE);

        $15btn.prop('disabled', false);
        $15btn.removeClass(BUTTONDISABLED);
        $15img.addClass(HIDEIMAGE);

        break;
      case 3:
        $00btn.prop('disabled', false);
        $00btn.removeClass(BUTTONDISABLED);
        $00img.addClass(HIDEIMAGE);

        $25btn.prop('disabled', false);
        $25btn.removeClass(BUTTONDISABLED);
        $25img.addClass(HIDEIMAGE);

        $20btn.prop('disabled', false);
        $20btn.removeClass(BUTTONDISABLED);
        $20img.addClass(HIDEIMAGE);

        $15btn.prop('disabled', true);
        $15btn.addClass(BUTTONDISABLED);
        $15img.removeClass(HIDEIMAGE);

        break;
      default:
        // NOP
    }

    $('.layout').append($modal);
  }

  setProperties(width) {
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

    try {
      $('.budget-content')[0].style.setProperty('--toolkit-content-width', contentWidth);
      $('.budget-inspector')[0].style.setProperty('--toolkit-inspector-width', inspectorWidth);

      // Save the users current selection for future page loads.
      toolkitHelper.setToolkitStorageKey('inspector-width', width);

      // Remove our click event handler and the modal div.
      $(document).off('click.toolkitInspector');
      $('#toolkitInspectorODiv').remove();
    } catch (e) {
      console.log('InspectorWidth::setProperties: Failed to set property!');
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }

}
