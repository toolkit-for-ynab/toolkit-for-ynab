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
  const [target, setTarget] = useState('');
  const [matchedTransactions, setMatchedTransactions] = useState([]);

  let handleInputSubmit = () => {
    hideReconcileInput();
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
    setTarget(target);
    setMatchedTransactions(possibleMatches);
    showConfirmationModal();
  };

  return (
    <>
      <ReconcileInputModal
        isOpen={isReconcileInputOpen}
        onClose={hideReconcileInput}
        onSubmit={handleInputSubmit}
        reconcileAmount={reconcileAmount}
        setReconcileAmount={setReconcileAmount}
      />

      <ReconcileConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={hideConfirmationModal}
        reconcileAmount={reconcileAmount}
        setReconcileAmount={setReconcileAmount}
        target={target}
        matchedTransactions={matchedTransactions}
      />
      <button className={'button'} onClick={showReconcileInput}>
        Auto Reconcile
      </button>
    </>
  );
};
