import React, { useState } from 'react';
import '../styles.scss';
import { setTransactionCleared } from '../autoReconcileUtils';
import { hidden } from 'ansi-colors';

export const ReconcileConfirmationModal = ({
  isOpen,
  onClose,
  reconcileAmount,
  setReconcileAmount,
  target,
  matchedTransactions,
}) => {
  if (!isOpen) {
    return null;
  }

  let handleAutoReconcileConfirmation = () => {
    if (matchedTransactions.length === 1) {
      let matchingSet = matchedTransactions[0];
      if (matchingSet.length > 0) {
        matchingSet.forEach(txn => {
          setTransactionCleared(txn);
        });
      }
    }
    onModalClose();
  };
  let onModalClose = () => {
    setReconcileAmount('');
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
