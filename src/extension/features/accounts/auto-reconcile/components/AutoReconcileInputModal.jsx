import React, { useState, useContext } from 'react';
import '../styles.scss';
import { AutoReconcileContext } from './AutoReconcileContext';
import { transactionReducer, generatePowerset, findMatchingSum } from '../autoReconcileUtils';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export const AutoReconcileInputModal = ({ isOpen, onSubmit, onClose }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const store = useContext(AutoReconcileContext);
  const [reconcileAmount, setReconcileAmount] = store.reconcileAmount;
  const [target, setTarget] = store.target;
  const [matchingTransactions, setMatchingTransactions] = store.matchingTransactions;

  // Hide if not showing
  if (!isOpen) {
    return null;
  }

  // Note: Workaround for ynab having an event listener that overrides the backspace.
  // We'll add our own event listener to remove it.
  let handleKeyDown = event => {
    if (event.keyCode === 8 && reconcileAmount && reconcileAmount.length >= 1) {
      setReconcileAmount(reconcileAmount.substring(0, reconcileAmount.length - 1));
    }
  };

  /**
   * Figure out which transactions add up to a specific target
   * Update the state to update target and any matched transactions
   */
  let autoreconcile = () => {
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

    // Update our context state
    setTarget(calculatedTarget);
    setMatchingTransactions(possibleMatches);
  };

  let onModalClose = () => {
    store.resetState();
    onClose();
  };

  const handleReconcileSubmit = () => {
    let errMsg = '';
    // Check if the current input is a number
    if (reconcileAmount.length === 0 || !isFinite(Number(reconcileAmount))) {
      errMsg = ' Please enter a valid amount.';
    }
    setErrorMessage(errMsg);
    if (errMsg.length === 0) {
      autoreconcile();
      onSubmit();
    }
  };

  return (
    <div className="tk-modal-container">
      <div className="tk-modal-content tk-modal-stack">
        <span className="tk-activity-header">Auto Reconcile</span>
        <p className="tk-autoreconcile-text">
          What is your <strong>current</strong> account balance?
        </p>
        <input
          type="text"
          className="tk-auto-reconcile-input tk-autoreconcile-text"
          value={reconcileAmount}
          onChange={e => setReconcileAmount(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {errorMessage.length > 0 && (
          <span className="tk-autoreconcile-text tk-auto-reconcile-error"> {errorMessage} </span>
        )}

        <div>
          <button
            className="auto-reconcile-action button button-primary tk-mg-r-1"
            onClick={handleReconcileSubmit}
          >
            {' '}
            Continue{' '}
          </button>
          <button className="button button-primary" onClick={onModalClose}>
            {' '}
            Close{' '}
          </button>
        </div>
      </div>
    </div>
  );
};
