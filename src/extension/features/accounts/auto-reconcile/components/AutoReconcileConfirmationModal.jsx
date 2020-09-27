import React, { useContext } from 'react';
import { setTransactionCleared } from '../autoReconcileUtils';
import { AutoReconcileContext } from './AutoReconcileContext';
import '../styles.scss';

export const AutoReconcileConfirmationModal = ({ isOpen, onSubmit, onClose }) => {
  const store = useContext(AutoReconcileContext);
  const [target, setTarget] = store.target;
  const [reconcileAmount, setReconcileAmount] = store.reconcileAmount;
  const [matchingTransactions, setMatchingTransactions] = store.matchingTransactions;

  if (!isOpen) {
    return null;
  }

  /**
   * For any matched transactions, toggle them to be cleared.
   * Reset state and close
   */
  let handleAutoReconcileConfirmation = () => {
    if (matchingTransactions.length === 1) {
      let matchingSet = matchingTransactions[0];
      if (matchingSet.length > 0) {
        matchingSet.forEach(txn => {
          setTransactionCleared(txn);
        });
      }
    }
    store.resetState();
    onSubmit();
  };

  let onModalClose = () => {
    store.resetState();
    onClose();
  };

  return (
    <div className="tk-modal-container">
      <div className="tk-modal-content tk-auto-reconcile-modal">
        <p className="auto-reconcile-prompt">
          There was a <strong>${target}</strong> difference.
          <br />
          Found 3 matching Transactions. Do you want to continue?
        </p>
        <div className="tk-modal-footer-action">
          <button
            className="auto-reconcile-action button button-primary tk-mg-r-1"
            onClick={handleAutoReconcileConfirmation}
          >
            {' '}
            Yes{' '}
          </button>
          <button className="button button-primary" onClick={onModalClose}>
            {' '}
            No{' '}
          </button>
        </div>
      </div>
    </div>
  );
};
