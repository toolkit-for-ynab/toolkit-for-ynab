import Feature from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';
import flags from './flags.json';

const redFlagLabel = flags.red.label;
const blueFlagLabel = flags.blue.label;
const orangeFlagLabel = flags.orange.label;
const yellowFlagLabel = flags.yellow.label;
const greenFlagLabel = flags.green.label;
const purpleFlagLabel = flags.purple.label;

const $modalOverlay =
  $('<div class="modal-generic modal-overlay active" style="display:none;"></div>');
const $modal = $('<div id="flags-modal" class="modal"></div>');
const $modalHeader = $('<div class="modal-header">Customize Flag Names</div><hr>');
const $modalContent = $('<div class="modal-content"><ul class="flags-list"></ul></div><hr>');
const $modalActions =
  $('<div class="modal-actions">' +
    '<button class="button button-primary" id="flags-save">OK <i class="flaticon stroke checkmark-2"><!----></i></button>' +
    '<button class="button button-cancel" id="flags-cancel">Cancel <i class="flaticon stroke x-2"><!----></i></button>' +
    '</div>' +
    '<div class="modal-arrow" style="position:absolute;width: 0;height: 0;bottom: 100%;left:150px;border: solid transparent;border-color: transparent;border-width: 15px;border-bottom-color: #ffffff"></div>');

export default class CustomFlagNames extends Feature {
  constructor() {
    super();
  }

  setupModal() {
    $modalOverlay.append($modal);
    $modal.append($modalHeader);
    $modal.append($modalContent);
    $modal.append($modalActions);
    $('body').append($modalOverlay);
    this.addFlagListItems();
    this.setModalStyles();
    this.addEventListeners();
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('account') !== -1;
  }

  invoke() {
    $('.ynab-grid-cell-flag .ynab-flag-red').parent().attr('title', redFlagLabel);
    $('.ynab-grid-cell-flag .ynab-flag-blue').parent().attr('title', blueFlagLabel);
    $('.ynab-grid-cell-flag .ynab-flag-orange').parent().attr('title', orangeFlagLabel);
    $('.ynab-grid-cell-flag .ynab-flag-yellow').parent().attr('title', yellowFlagLabel);
    $('.ynab-grid-cell-flag .ynab-flag-green').parent().attr('title', greenFlagLabel);
    $('.ynab-grid-cell-flag .ynab-flag-purple').parent().attr('title', purpleFlagLabel);
  }

  observe(changedNodes) {
    console.log('changedNodes', changedNodes);
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-flag-red') || changedNodes.has('ynab-flag-blue')
      || changedNodes.has('ynab-flag-orange') || changedNodes.has('ynab-flag-yellow')
      || changedNodes.has('ynab-flag-green') || changedNodes.has('ynab-flag-purple')) {
      this.invoke();
    }

    if (changedNodes.has('ynab-u modal-popup modal-account-flags ember-view modal-overlay active')) {
      $('.ynab-flag-red .label, .ynab-flag-red .label-bg').html(redFlagLabel);
      // $('.ynab-flag-red .label-bg').html(redFlagLabel);
      $('.ynab-flag-blue .label, .ynab-flag-blue .label-bg').html(blueFlagLabel);
      // $('.ynab-flag-blue .label-bg').html(blueFlagLabel);
      $('.ynab-flag-orange .label, .ynab-flag-orange .label-bg').html(orangeFlagLabel);
      // $('.ynab-flag-orange .label-bg').html(orangeFlagLabel);
      $('.ynab-flag-yellow .label, .ynab-flag-yellow .label-bg').html(yellowFlagLabel);
      // $('.ynab-flag-yellow .label-bg').html(yellowFlagLabel);
      $('.ynab-flag-green .label, .ynab-flag-green .label-bg').html(greenFlagLabel);
      // $('.ynab-flag-green .label-bg').html(greenFlagLabel);
      $('.ynab-flag-purple .label, .ynab-flag-purple .label-bg').html(purpleFlagLabel);
      // $('.ynab-flag-purple .label-bg').html(purpleFlagLabel);
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.addFlagsMenu();
    this.setupModal();
    this.invoke();
  }

  addFlagsMenu() {
    $('.accounts-toolbar-right')
      .append('<button id="flags-menu" title="Edit Flag Names" class="button">Flags<i class="flaticon stroke down"><!----></i></button>');
  }

  addFlagListItems() {
    $('ul.flags-list').empty();
    for (var key in flags) {
      var flag = flags[key];
      $('ul.flags-list').append('<li><input type="text" style="color: #fff; fill: ' + flag.color + '; background-color: ' + flag.color + '; height: 30px; padding:.5em .7em;" value="' + flag.label + '" placeholder="' + flag.label + '" /></li>');
    }
  }

  setModalStyles() {
    $('ul.flags-list').css({ 'text-align': 'left', padding: '.4em 0', margin: '0', zoom: '1', 'list-style-type': 'none' });
    $('ul.flags-list li').css({ color: '#588697', 'text-align': 'left', 'list-style': 'none', 'font-size': '1em', padding: '0 .3em', 'padding-bottom': '.3em', position: 'relative' });
  }

  addEventListeners() {
    $('#flags-menu').click(function () {
      const offset = $('#flags-menu').offset();
      const height = $('#flags-menu').height();
      const width = $('#flags-menu').width();
      const top = offset.top + height + 30;
      const left = offset.left + width - $modal.width() / 2;
      $modal.css({ width: '20em', left: left, top: top });
      $modalOverlay.show();
    });
    $('#flags-cancel').click(function () {
      $modalOverlay.hide();
    });
    $('#flags-save').click(function () {
      $modalOverlay.hide();
    });
    $modalOverlay.click(function () {
      $modalOverlay.hide();
    });
    $modal.click(function (event) {
      event.stopPropagation();
    });
  }
}
