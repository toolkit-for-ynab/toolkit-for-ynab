import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Feature } from 'toolkit/extension/features/feature';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { controllerLookup, getEmberView } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { componentAppend } from 'toolkit/extension/utils/react';

function CopyTransactionsButton({ transactions }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyTransactions = () => {
    copyTransactionsToClipboard(transactions);

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    transactions &&
    !!transactions.length && (
      <button
        id="tk-copy-transactions"
        className="button button-primary"
        onClick={handleCopyTransactions}
      >
        {isCopied ? 'Copied!' : 'Copy Transactions'}
      </button>
    )
  );
}

CopyTransactionsButton.propTypes = {
  transactions: PropTypes.array,
};

export class CategoryActivityCopy extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(
      this,
      'budget/budget-activity',
      'didRender',
      this.handleBudgetActivityModal
    );

    addToolkitEmberHook(
      this,
      'modals/reports/activity-transactions',
      'didRender',
      this.handleReportActivityModal
    );
  }

  handleBudgetActivityModal = element => {
    if ($('#tk-copy-transactions').length) {
      return;
    }

    componentAppend(
      <CopyTransactionsButton
        transactions={controllerLookup('budget').get('selectedActivityTransactions') || []}
      />,
      element.querySelector('.modal-actions')
    );
  };

  handleReportActivityModal = element => {
    if ($('#tk-copy-transactions').length) {
      return;
    }

    componentAppend(
      <CopyTransactionsButton transactions={getEmberView(element.id).sortedTransactions || []} />,
      element.querySelector('.modal-actions')
    );
  };
}

function copyTransactionsToClipboard(transactions) {
  const entityManager = getEntityManager();
  const activities = transactions.map(transaction => {
    const parentEntityId = transaction.get('parentEntityId');
    let payeeId = transaction.get('payeeId');

    if (parentEntityId) {
      payeeId = entityManager.transactionsCollection
        .findItemByEntityId(parentEntityId)
        .get('payeeId');
    }

    const payee = entityManager.payeesCollection.findItemByEntityId(payeeId);

    return {
      Account: transaction.get('accountName'),
      Date: ynab.formatDateLong(transaction.get('date').toString()),
      Payee: payee && payee.get('name') ? payee.get('name') : 'Unknown',
      Category: transaction.get('subCategoryNameWrapped'),
      Memo: transaction.get('memo'),
      Amount: ynab.formatCurrency(transaction.get('amount')),
    };
  });

  const replacer = (key, value) => (value === null ? '' : value);
  const header = Object.keys(activities[0]);
  let csv = activities.map(row =>
    header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join('\t')
  );
  csv.unshift(header.join('\t'));
  csv = csv.join('\r\n');
  let $temp = $('<textarea style="position:absolute; left: -9999px; top: 50px;"/>');
  $('body').append($temp);
  $temp.val(csv).select();
  document.execCommand('copy');
  $temp.remove();
}
