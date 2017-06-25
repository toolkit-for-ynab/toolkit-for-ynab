import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

let flags;
let redFlagLabel;
let blueFlagLabel;
let orangeFlagLabel;
let yellowFlagLabel;
let greenFlagLabel;
let purpleFlagLabel;

export class CustomFlagNames extends Feature {
  constructor() {
    super();
    if (!toolkitHelper.getToolkitStorageKey('flags')) {
      this.storeDefaultFlags();
    }
    if (typeof flags === 'undefined') {
      flags = JSON.parse(toolkitHelper.getToolkitStorageKey('flags'));
      this.updateFlagLabels();
    }
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
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('layout user-logged-in') || changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }

    if (changedNodes.has('ynab-u modal-popup modal-account-flags ember-view modal-overlay active')) {
      $('.ynab-flag-red .label, .ynab-flag-red .label-bg').text(redFlagLabel);
      $('.ynab-flag-blue .label, .ynab-flag-blue .label-bg').text(blueFlagLabel);
      $('.ynab-flag-orange .label, .ynab-flag-orange .label-bg').text(orangeFlagLabel);
      $('.ynab-flag-yellow .label, .ynab-flag-yellow .label-bg').text(yellowFlagLabel);
      $('.ynab-flag-green .label, .ynab-flag-green .label-bg').text(greenFlagLabel);
      $('.ynab-flag-purple .label, .ynab-flag-purple .label-bg').text(purpleFlagLabel);

      $('.modal-account-flags .modal').css({ height: '22em' }).append(
        $('<div>', { id: 'account-flags-actions' }).css({ padding: '0 .3em' }).append(
          $('<button>', { id: 'flags-edit', class: 'button button-primary' }).append(
            'Edit '
          ).append($('<i>', { class: 'flaticon stroke compose-3' }))
        )
      );

      this.addEventListeners();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  addEventListeners() {
    let $this = this;
    $('#flags-edit').click(function () {
      $('.modal-account-flags .modal-list').empty();

      for (let key in flags) {
        let flag = flags[key];

        $('.modal-account-flags .modal-list').append(
          $('<li>').append(
            $('<input>', { id: key, type: 'text', class: 'flag-input', value: flag.label, placeholder: flag.label }).css({ color: '#fff', fill: flag.color, 'background-color': flag.color, height: 30, padding: '0 .7em', 'margin-bottom': '.3em', border: 'none' })
          )
        );
      }

      $('#account-flags-actions').empty();

      $('#account-flags-actions').append(
        $('<button>', { id: 'flags-close', class: 'button button-primary' }).append(
          'Ok '
        ).append($('<i>', { class: 'flaticon stroke checkmark-2' }))
      );

      $('input.flag-input').focus(function () {
        $(this).css({
          color: '#000'
        });
      });

      $('input.flag-input').blur(function () {
        $(this).css({
          color: '#fff'
        });
        $this.saveFlag($(this));
      });

      $('#flags-close').click(function () {
        $('.modal-overlay').click();
      });
    });
  }

  saveFlag(flag) {
    if (flag.attr('placeholder') !== flag.val()) {
      let key = flag.attr('id');

      flags[key].label = flag.val();
      toolkitHelper.setToolkitStorageKey('flags', JSON.stringify(flags));

      this.updateFlagLabels();
      this.invoke();
    }
  }

  updateFlagLabels() {
    redFlagLabel = flags.red.label;
    blueFlagLabel = flags.blue.label;
    orangeFlagLabel = flags.orange.label;
    yellowFlagLabel = flags.yellow.label;
    greenFlagLabel = flags.green.label;
    purpleFlagLabel = flags.purple.label;
  }

  storeDefaultFlags() {
    const flagsJSON = {
      red: {
        label: 'Red',
        color: '#d43d2e'
      },
      orange: {
        label: 'Orange',
        color: '#ff7b00'
      },
      yellow: {
        label: 'Yellow',
        color: '#f8e136'
      },
      green: {
        label: 'Green',
        color: '#9ac234'
      },
      blue: {
        label: 'Blue',
        color: '#0082cb'
      },
      purple: {
        label: 'Purple',
        color: '#9384b7'
      }
    };
    toolkitHelper.setToolkitStorageKey('flags', JSON.stringify(flagsJSON));
  }
}
