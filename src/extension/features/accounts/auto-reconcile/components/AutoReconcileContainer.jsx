import React, { useState } from 'react';
import { useModal } from '../hooks/useModal';
import { ReconcileInputModal } from './ReconcileInputModal';
import { ReconcileConfirmationModal } from './ReconcileConfirmationModal';
import {
  transactionReducer,
  generatePowerset,
  findMatchingSum,
  setTransactionCleared,
} from '../autoReconcileUtils';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export const AutoReconcileContainer = () => {
  const [isReconcileInputOpen, showReconcileInput, hideReconcileInput] = useModal(false);
  const [isConfirmationOpen, showConfirmationModal, hideConfirmationModal] = useModal(false);
  const [reconcileAmount, setReconcileAmount] = useState('');

  let handleAutoReconcileSubmit = () => {
    hideReconcileInput();
    showConfirmationModal();
  };

  let handleConfirmationSubmit = () => {
    let { selectedAccountId } = controllerLookup('accounts');
    let account = getEntityManager().getAccountById(selectedAccountId);
    let transactions = account.getTransactions();
    let nonreconciledTransactions = transactions.filter(
      txn => txn.cleared && !txn.isTombstone && !txn.isReconciled()
    );

    // Sum up all reconciled transactions
    let reconciledTransactions = transactions.filter(
      txn => txn.cleared && !txn.isTombstone && txn.isReconciled()
    );

    // Figure out our target by summing up the reconciled amount
    let reconciledTotal = reconciledTransactions.reduce(transactionReducer, 0);
    let target = reconcileAmount * 1000 - reconciledTotal;
    let transactionPowerset = generatePowerset(nonreconciledTransactions);
    let possibleMatches = findMatchingSum(transactionPowerset, target);
    if (possibleMatches.length === 1) {
      let matchedTransactions = possibleMatches[0];
      matchedTransactions.forEach(transaction => setTransactionCleared(transaction));
    }
  };

  return (
    <>
      <ReconcileInputModal
        isOpen={isReconcileInputOpen}
        onClose={hideReconcileInput}
        onSubmit={handleAutoReconcileSubmit}
        reconcileAmount={reconcileAmount}
        setReconcileAmount={setReconcileAmount}
      />

      <ReconcileConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={hideConfirmationModal}
        onSubmit={handleConfirmationSubmit}
        reconcileAmount={reconcileAmount}
        setReconcileAmount={setReconcileAmount}
      />
      <button className={'button'} onClick={showReconcileInput}>
        Auto Reconcile
      </button>
    </>
  );
};
