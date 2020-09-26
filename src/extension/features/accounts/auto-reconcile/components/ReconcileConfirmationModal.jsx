import React, { useState } from 'react';
import '../styles.scss';

export const ReconcileConfirmationModal = ({
  isOpen,
  onClose,
  onSubmit,
  reconcileAmount,
  setReconcileAmount,
}) => {
  if (!isOpen) {
    return null;
  }

  let onModalClose = () => {
    setReconcileAmount('');
    onClose();
  };

  return (
    <div className="tk-modal-container">
      <div className="tk-modal-content tk-auto-reconcile-modal">
        <p className="auto-reconcile-prompt">
          There is a <strong>${reconcileAmount}</strong> difference.
          <br />
          Do you want to continue?
        </p>
        <div className="tk-modal-footer-action">
          <button
            className="auto-reconcile-action button button-primary tk-mg-r-1"
            onClick={onSubmit}
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
