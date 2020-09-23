import React, { useState, useEffect } from 'react';
import '../styles.scss';

export const ReconcileInputModal = ({ isShowing, onClose }) => {
  const [reconcileAmount, setReconcileAmount] = useState(0.0);
  if (!isShowing) {
    return null;
  }
  let handleReconcileAmount = e => {
    console.log(e);
    console.log('Curr' + reconcileAmount);
    setReconcileAmount(e.target.value);
  };
  return (
    <div className="tk-modal-container">
      <div className="tk-modal-content">
        <div className="tk-reconcileinput-content">
          <h2>Auto Reconcile</h2>
          <div className="tk-modal-body">
            <p>Enter your ammount</p>
            <input
              type="text"
              className="auto-reconcile-input"
              value={reconcileAmount}
              onChange={e => setReconcileAmount(e.target.value)}
            />
          </div>
          <div className="tk-modal-footer-action">
            <button
              className="auto-reconcile-action button button-primary"
              onClick={() => {
                console.log('Foo');
              }}
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
    </div>
  );
};
