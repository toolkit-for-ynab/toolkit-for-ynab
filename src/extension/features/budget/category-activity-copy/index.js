import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage, getEntityManager } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class CategoryActivityCopy extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
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
    const activityTransactions = controllerLookup('budget').get('selectedActivityTransactions');
    const entityManager = getEntityManager();

    const activities = activityTransactions.map((transaction) => {
      const parentEntityId = transaction.get('parentEntityId');
      let payeeId = transaction.get('payeeId');

      if (parentEntityId) {
        payeeId = entityManager.transactionsCollection.findItemByEntityId(parentEntityId).get('payeeId');
      }

      const payee = entityManager.payeesCollection.findItemByEntityId(payeeId);

      return {
        Account: transaction.get('accountName'),
        Date: ynab.formatDateLong(transaction.get('date').toNativeDate()),
        Payee: payee.get('name'),
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
