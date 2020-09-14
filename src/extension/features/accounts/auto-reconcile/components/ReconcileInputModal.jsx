import React from 'react';
import '../styles.scss';

export const ReconcileInputModal = ({ isShowing, onClose }) => {
  if (!isShowing) return null;
  return (
    <div className="tk-modal-container">
      <div className="tk-reconcile-modal">
        <div> Modal Header </div>
        <div> Modal Content </div>
        <div>
          <button className="button button-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
