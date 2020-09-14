import React, { useState } from 'react';
import { ReconcileInputModal } from './ReconcileInputModal';

export const AutoReconcileContainer = () => {
  const [showReconcileInputModal, setShowReconcileInputModal] = useState(false);

  const show = () => {
    setShowReconcileInputModal(true);
  };

  const hide = () => {
    setShowReconcileInputModal(false);
  };
  return (
    <>
      <ReconcileInputModal isShowing={showReconcileInputModal} onClose={hide} />
      <button className={'button'} onClick={show}>
        Auto Reconcile
      </button>
    </>
  );
};
