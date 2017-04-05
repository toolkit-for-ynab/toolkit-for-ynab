import Feature from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';
import flags from './flags.json';
const fs = require('fs');

const redFlagLabel = flags.red.label;
const blueFlagLabel = flags.blue.label;
const orangeFlagLabel = flags.orange.label;
const yellowFlagLabel = flags.yellow.label;
const greenFlagLabel = flags.green.label;
const purpleFlagLabel = flags.purple.label;

export default class CustomFlagNames extends Feature {
  constructor() {
    super();
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
      $('.ynab-flag-blue .label, .ynab-flag-blue .label-bg').html(blueFlagLabel);
      $('.ynab-flag-orange .label, .ynab-flag-orange .label-bg').html(orangeFlagLabel);
      $('.ynab-flag-yellow .label, .ynab-flag-yellow .label-bg').html(yellowFlagLabel);
      $('.ynab-flag-green .label, .ynab-flag-green .label-bg').html(greenFlagLabel);
      $('.ynab-flag-purple .label, .ynab-flag-purple .label-bg').html(purpleFlagLabel);

      $('.modal-account-flags .modal').css({ height: '22em' })
        .append('<div id="account-flags-actions" style="padding: 0 .3em"><button id="flags-edit" class="button button-primary">Edit <i class="flaticon stroke compose-3"><!----></i></button></div>');

      this.addEventListeners();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  addEventListeners() {
    $('#flags-edit').click(function () {
      $('.modal-account-flags .modal-list').empty();

      for (var key in flags) {
        let flag = flags[key];
        $('.modal-account-flags .modal-list').append('<li><input type="text" id="' + key + '" class="flag-input" style="color: #fff; fill: ' + flag.color + '; background-color: ' + flag.color + '; height: 30px; padding:0 .7em; margin-bottom: .3em; border: none;" value="' + flag.label + '" placeholder="' + flag.label + '" /></li>');
      }

      $('#account-flags-actions').empty();

      $('#account-flags-actions').append('<button id="flags-cancel" class="button button-primary">Cancel <i class="flaticon stroke x-2"><!----></i></button>');

      $('#account-flags-actions').append('<button id="flags-save" class="button button-primary" style="float:right">Save <i class="flaticon stroke checkmark-2"><!----></i></button>');

      $('input.flag-input').focus(function () {
        $(this).css({
          color: '#000'
        });
      });

      $('input.flag-input').blur(function () {
        console.log('$(this)', $(this));
        console.log('this', this);
        $(this).css({
          color: '#fff'
        });
      });

      $('#flags-cancel').click(function () {
        $('.modal-overlay').click();
      });

      $('#flags-save').click(function () {
        $('.modal-overlay').click();
      });
    });
  }
}
