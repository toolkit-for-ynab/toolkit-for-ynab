import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class CategoryActivityCopy extends Feature {
  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    $('.modal-actions > .button-primary').clone().attr('id', 'toolkit-copy-button')
      .insertAfter('.modal-actions > .button-primary')
      .on('click', this.categoryActivityCopy);

    var childCache = $('#toolkit-copy-button').children();
    $('#toolkit-copy-button').text('Copy Transactions').append(childCache);
    $('#toolkit-copy-button > .flaticon').toggleClass('checkmark-2 copy').css('margin-left', '3px');
  }

  categoryActivityCopy() {
    const budgetController = controllerLookup('budget');
    const activityTransactions = budgetController.get('selectedActivityTransactions');
    const activities = activityTransactions.map((transaction) => {
      return {
        Account: transaction.get('accountName'),
        Date: ynab.formatDateLong(transaction.get('date')),
        Category: transaction.get('subCategoryNameWrapped'),
        Memo: transaction.get('memo'),
        Amount: ynab.formatCurrency(transaction.get('amount'))
      };
    });

    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(activities[0]);
    let csv = activities.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join('\t'));
    csv.unshift(header.join('\t'));
    csv = csv.join('\r\n');
    let $temp = $('<textarea style="position:absolute; left: -9999px; top: 50px;"/>');
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
