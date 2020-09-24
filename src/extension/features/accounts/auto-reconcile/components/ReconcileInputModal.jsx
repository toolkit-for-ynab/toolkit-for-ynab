import React, { useState } from 'react';
import '../styles.scss';

export const ReconcileInputModal = ({ isShowing, onClose }) => {
  const [reconcileAmount, setReconcileAmount] = useState('');
  if (!isShowing) {
    return null;
  }

  // Note: Workaround for ynab having an event listener that overrides the backspace.
  // We'll add our own event listener to remove it.
  let handleKeyDown = event => {
    if (event.keyCode === 8 && reconcileAmount && reconcileAmount.length >= 1) {
      setReconcileAmount(reconcileAmount.substring(0, reconcileAmount.length - 1));
    }
  };

  let handleAutoReconcileSubmit = () => {
    // Validate that its a valid amount
    // If any errors, set error on input
    // Do the calculation:
    // - Inputs: CurrentAmount, AccountId
    // __toolkitUtils.getEntityManager().getAccountById('7bbf8e31-6746-46b6-81de-144735bf4c5c').getAccountCalculation()
    //   - clearedBalance
    //   - unclearedBalance
  };

  return (
    <div className="tk-modal-container">
      <div className="tk-modal-content tk-auto-reconcile-modal">
        <h2 className="auto-reconcile-header">Auto Reconcile</h2>
        <p className="auto-reconcile-prompt">
          What is your <strong>current</strong> account balance?
        </p>
        <input
          type="text"
          className="auto-reconcile-input"
          value={reconcileAmount}
          onChange={e => setReconcileAmount(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* // Footer */}
        <div className="tk-modal-footer-action">
          <button
            className="auto-reconcile-action button button-primary tk-mg-r-1"
            onClick={handleAutoReconcileSubmit}
          >
            {' '}
            AutoReconcile{' '}
          </button>
          <button className="button button-primary" onClick={onClose}>
            {' '}
            Close{' '}
          </button>
        </div>
      </div>
    </div>
  );
};
