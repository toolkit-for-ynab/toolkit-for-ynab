import React from 'react';
import { useModal } from '../hooks/useModal';
import { AutoReconcileInputModal } from './AutoReconcileInputModal';
import { AutoReconcileConfirmationModal } from './AutoReconcileConfirmationModal';
import { AutoReconcileProvider } from './AutoReconcileContext';

/**
 * Container for the Auto Reconcile feature wrapping its child components
 * See AutoReconcileContext for shared state
 *
 * Flow:
 * 1. Click on Auto Reconcile
 * 2. Show Input Modal
 * 3. Hide Input Modal, Show Matching Transactions Results
 * 4. Clear Matching Transactions if any, Hide Result Modal
 */
export const AutoReconcileContainer = () => {
  const [isReconcileInputOpen, showReconcileInput, hideReconcileInput] = useModal(false);
  const [isConfirmationOpen, showConfirmationModal, hideConfirmationModal] = useModal(false);

  let reconcileSubmitFlow = () => {
    hideReconcileInput();
    showConfirmationModal();
  };

  return (
    <>
      <AutoReconcileProvider>
        <AutoReconcileInputModal
          isOpen={isReconcileInputOpen}
          onClose={hideReconcileInput}
          onSubmit={reconcileSubmitFlow}
        />

        <AutoReconcileConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={hideConfirmationModal}
          onSubmit={hideConfirmationModal}
        />
        <button className={'button'} onClick={showReconcileInput}>
          Auto Reconcile
        </button>
      </AutoReconcileProvider>
    </>
  );
};
