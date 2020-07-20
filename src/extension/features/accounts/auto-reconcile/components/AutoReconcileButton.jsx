import React from 'react';
import { ReconcileInputModal } from './ReconcileInputModal';

export const AutoReconcileButton = () => {
  return (
    <button
      className={'button'}
      onClick={() => {
        return <ReconcileInputModal />;
      }}
    >
      Auto Reconcile
    </button>
  );
};
