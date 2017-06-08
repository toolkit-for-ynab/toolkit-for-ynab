import Feature from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export default class CategoryActivityCopy extends Feature {
  constructor() {
    super();
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    $('.modal-actions > .button-primary').clone().attr('id', 'CopyBtn')
        .insertAfter('.modal-actions > .button-primary')
        .on('click', this.categoryActivityCopy);

    var childCache = $('#CopyBtn').children();
    $('#CopyBtn').text('Copy Transactions').append(childCache);
    $('#CopyBtn > .flaticon').toggleClass('checkmark-2 copy').css('margin-left', '3px');
  }

  categoryActivityCopy() {
    var activities = [];
    var account = $('.activity-header').text();

    $('.ynab-table-row').each(function () {
      var columns = $(this).children('.user-data');
      var row = {};
      if ($('.modal-content').children('.budget-activity-debt-info').length > 0) {
        row = {
          Account: account,
          Date: $(columns[0]).text().trim(),
          Payee: columns[1].title,
          Category: columns[2].title,
          Memo: columns[3].title,
          Amount: columns[4].title
        };
      } else {
        row = {
          Account: columns[0].title,
          Date: $(columns[1]).text().trim(),
          Payee: columns[2].title,
          Memo: columns[3].title,
          Amount: columns[4].title
        };
      }
      activities.push(row);
    });

    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(activities[0]);
    let csv = activities.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join('\t'));
    csv.unshift(header.join('\t'));
    csv = csv.join('\r\n');
    var $temp = $('<textarea style="position:absolute; left: -9999px; top: 50px;"/>');
    $('body').append($temp);
    $temp.val(csv).select();
    document.execCommand('copy');
    $temp.remove();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    if (changedNodes.has('ynab-u modal-popup modal-budget-activity ember-view modal-overlay active')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }

}
