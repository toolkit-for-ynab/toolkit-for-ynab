import Feature from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';
import flags from './flags.json';

const redFlag = flags.red.label;
const blueFlag = flags.blue.label;
const orangeFlag = flags.orange.label;
const yellowFlag = flags.yellow.label;
const greenFlag = flags.green.label;
const purpleFlag = flags.purple.label;
let $modal;

export default class CustomFlagNames extends Feature {
  constructor() {
    super();
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('account') !== -1;
  }


  invoke() {
    $('.ynab-grid-cell-flag .ynab-flag-red').parent().attr('title', redFlag);
    $('.ynab-grid-cell-flag .ynab-flag-blue').parent().attr('title', blueFlag);
    $('.ynab-grid-cell-flag .ynab-flag-orange').parent().attr('title', orangeFlag);
    $('.ynab-grid-cell-flag .ynab-flag-yellow').parent().attr('title', yellowFlag);
    $('.ynab-grid-cell-flag .ynab-flag-green').parent().attr('title', greenFlag);
    $('.ynab-grid-cell-flag .ynab-flag-purple').parent().attr('title', purpleFlag);
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-flag-red') || changedNodes.has('ynab-flag-blue')
      || changedNodes.has('ynab-flag-orange') || changedNodes.has('ynab-flag-yellow')
      || changedNodes.has('ynab-flag-green') || changedNodes.has('ynab-flag-purple')) {
      this.invoke();
    }

    if (changedNodes.has('ynab-u modal-popup modal-account-flags ember-view modal-overlay active')) {
      $('.ynab-flag-red .label').html(redFlag);
      $('.ynab-flag-red .label-bg').html(redFlag);
      $('.ynab-flag-blue .label').html(blueFlag);
      $('.ynab-flag-blue .label-bg').html(blueFlag);
      $('.ynab-flag-orange .label').html(orangeFlag);
      $('.ynab-flag-orange .label-bg').html(orangeFlag);
      $('.ynab-flag-yellow .label').html(yellowFlag);
      $('.ynab-flag-yellow .label-bg').html(yellowFlag);
      $('.ynab-flag-green .label').html(greenFlag);
      $('.ynab-flag-green .label-bg').html(greenFlag);
      $('.ynab-flag-purple .label').html(purpleFlag);
      $('.ynab-flag-purple .label-bg').html(purpleFlag);
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    addFlagModal();
    addFlagMenu();
    this.invoke();
  }
}

function addFlagModal() {
  $modal = $(
    '<div class="ynab-u modal-generic modal-account-filters ember-view modal-overlay active">' +
    '<div id="flag-modal" class="modal" style="left: 1149px; top: 72.2969px;">' +
    '<div class="modal-header">Flag Names</div>' +
    '<div class="modal-content">' +
    '<hr>' +
    '<ul>' +
    '<li style="fill: #d43d2e; background-color: #d43d2e;">Red</li>' +
    '<li style="fill: #ff7b00; background-color: #ff7b00;">Orange</li>' +
    '<li style="fill: #f8e136; background-color: #f8e136;">Yellow</li>' +
    '<li style="fill: #9ac234; background-color: #9ac234;">Green</li>' +
    '<li style="fill: #0082cb; background-color: #0082cb;">Blue</li>' +
    '<li style="fill: #9384b7; background-color: #9384b7;">Purple</li>' +
    '</ul>' +
    '</div>' +
    '<hr>' +
    '<div class="modal-actions">' +
    '<button class="button button-primary" id="flags-ok">OK <i class="flaticon stroke checkmark-2"><!----></i></button>' +
    '<button class="button button-cancel" id="flags-cancel">Cancel <i class="flaticon stroke x-2"><!----></i></button>' +
    '</div>' +
    '<div class="modal-arrow" style="position:absolute;width: 0;height: 0;bottom: 100%;left:277.453125px;border: solid transparent;border-color: transparent;border-width: 15px;border-bottom-color: #ffffff"></div>' +
    '</div></div>');
  $('body').append($modal);
  $modal.hide();
  console.log('addFlagModal');
}

function addFlagMenu() {
  $('.accounts-toolbar-right')
    .append('<button id="flag-menu" title="Edit Flag Names" class="button">Flags<i class="flaticon stroke down"><!----></i></button>');
  $('#flag-menu').click(function () {
    $modal.show();
  });
}
