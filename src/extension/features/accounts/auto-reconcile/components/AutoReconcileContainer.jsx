import React, { useState } from 'react';
import { useModal } from '../hooks/useModal';
import { transactionReducer, generatePowerset, findMatchingSum } from '../autoReconcileUtils';
import { AutoReconcileConfirmationModal } from './AutoReconcileConfirmationModal';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export const AutoReconcileContainer = () => {
  const [isConfirmationOpen, showConfirmationModal, hideConfirmationModal] = useModal(false);
  const [target, setTarget] = useState(0);
  const [matchingTransactions, setMatchingTransactions] = useState([]);

  /**
   * Figure out which transactions add up to a specific target
   * Update the state to update target and any matched transactions
   */
  let onSubmit = () => {
    let reconcileAmount = $('.modal-account-reconcile-enter-balance')
      .find('input')
      .val();

    let { selectedAccountId } = controllerLookup('accounts');
    let account = getEntityManager().getAccountById(selectedAccountId);
    let transactions = account.getTransactions();

    // Get all the non reconciled transactions
    let nonreconciledTransactions = transactions.filter(
      txn => txn.cleared && !txn.isTombstone && !txn.isReconciled()
    );

    // Sum up all reconciled transactions
    let reconciledTransactions = transactions.filter(
      txn => txn.cleared && !txn.isTombstone && txn.isReconciled()
    );

    // Figure out our target by summing up the reconciled amount
    let reconciledTotal = reconciledTransactions.reduce(transactionReducer, 0);
    let calculatedTarget = reconcileAmount * 1000 - reconciledTotal;

    // Figure out which of the non reconciled transactions add up to our target
    let transactionPowerset = generatePowerset(nonreconciledTransactions);
    let possibleMatches = findMatchingSum(transactionPowerset, calculatedTarget);

    // Update context state
    setTarget(calculatedTarget);
    setMatchingTransactions(possibleMatches);
    showConfirmationModal();
  };

  return (
    <>
      <AutoReconcileConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={hideConfirmationModal}
        target={target}
        matchingTransactions={matchingTransactions}
      />
      <button className={'button-primary button'} onClick={onSubmit}>
        Clear
      </button>
    </>
  );
};
