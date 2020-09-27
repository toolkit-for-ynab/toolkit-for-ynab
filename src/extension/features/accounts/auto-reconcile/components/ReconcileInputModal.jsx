import React, { useState } from 'react';
import '../styles.scss';

export const ReconcileInputModal = ({
  isOpen,
  onSubmit,
  onClose,
  reconcileAmount,
  setReconcileAmount,
}) => {
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) {
    return null;
  }

  let onModalClose = () => {
    setReconcileAmount('');
    setErrorMessage('');
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
      onSubmit();
    }
  };

  // Note: Workaround for ynab having an event listener that overrides the backspace.
  // We'll add our own event listener to remove it.
  let handleKeyDown = event => {
    if (event.keyCode === 8 && reconcileAmount && reconcileAmount.length >= 1) {
      setReconcileAmount(reconcileAmount.substring(0, reconcileAmount.length - 1));
    }
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
        {errorMessage.length > 0 && (
          <span className="auto-reconcile-prompt auto-reconcile-error"> {errorMessage} </span>
        )}
        {/* // Footer */}
        <div className="tk-modal-footer-action">
          <button
            className="auto-reconcile-action button button-primary tk-mg-r-1"
            onClick={handleReconcileSubmit}
          >
            {' '}
            AutoReconcile{' '}
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
