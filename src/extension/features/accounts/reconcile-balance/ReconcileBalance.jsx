import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export const ReconcileBalanceComponent = ({ selectedAccountId }) => {
  const [reconciledBalance, setReconciledBalance] = useState(0);
  useEffect(() => {
    setReconciledBalance(calculateReconciledBalance(selectedAccountId));
  }, [
    getEntityManager()
      .getAccountById(selectedAccountId)
      .getTransactions(),
  ]);

  let calculateReconciledBalance = accountId => {
    let account = getEntityManager().getAccountById(accountId);
    let transactions = account.getTransactions();
    let reconciledTransactions = transactions.filter(
      txn => txn.cleared && !txn.isTombstone && txn.isReconciled()
    );
    let balance = reconciledTransactions.reduce((accum, txn) => {
      return accum + txn.amount;
    }, 0);
    return balance;
  };

  return (
    <div className="tk-accounts-header-balances-reconciled">
      <span>{formatCurrency(reconciledBalance)}</span>
      <div className="tk-accounts-header-reconcile-balance-label">Reconciled Balance</div>
    </div>
  );
};

ReconcileBalanceComponent.propTypes = {
  selectedAccountId: PropTypes.string.isRequired,
};
