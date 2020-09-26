import React, { useState } from 'react';
import { useModal } from '../hooks/useModal';
import { ReconcileInputModal } from './ReconcileInputModal';
import { ReconcileConfirmationModal } from './ReconcileConfirmationModal';
import { calculateTarget } from '../autoReconcileUtils';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export const AutoReconcileContainer = () => {
  const [isReconcileInputOpen, showReconcileInput, hideReconcileInput] = useModal(false);
  const [isConfirmationOpen, showConfirmationModal, hideConfirmationModal] = useModal(false);
  const [reconcileAmount, setReconcileAmount] = useState('');

  let handleAutoReconcileSubmit = () => {
    hideReconcileInput();
    showConfirmationModal();
  };

  let handleConfirmationSubmit = () => {
    let { selectedAccountId } = controllerLookup('accounts');
    let account = getEntityManager().getAccountById(selectedAccountId);
    let accountDetails = account.getAccountCalculation();
    let { unclearedBalance, clearedBalance } = accountDetails;
    debugger;
  };

  return (
    <>
      <ReconcileInputModal
        isOpen={isReconcileInputOpen}
        onClose={hideReconcileInput}
        onSubmit={handleAutoReconcileSubmit}
        reconcileAmount={reconcileAmount}
        setReconcileAmount={setReconcileAmount}
      />

      <ReconcileConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={hideConfirmationModal}
        onSubmit={handleConfirmationSubmit}
        reconcileAmount={reconcileAmount}
        setReconcileAmount={setReconcileAmount}
      />
      <button className={'button'} onClick={showReconcileInput}>
        Auto Reconcile
      </button>
    </>
  );
};
