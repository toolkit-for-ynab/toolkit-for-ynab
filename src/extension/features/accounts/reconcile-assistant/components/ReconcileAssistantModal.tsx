import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { TransactionsTable } from './TransactionsTable';
import { CarouselSelector } from './CarouselSelector';
import { setTransactionCleared } from '../reconcileAssistantUtils';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import resources from '../resources';
import '../styles.scss';

interface ReconcileAssistantModalProps {
  portalId: string;
  isOpen: boolean;
  setModalOpened: (isOpen: boolean) => void;
  matchingTransactions: Array<Array<Transaction>>;
  clearedTotal: number;
  target: number;
}

export const ReconcileAssistantModal: React.FC<ReconcileAssistantModalProps> = ({
  portalId,
  isOpen,
  setModalOpened,
  matchingTransactions,
  clearedTotal,
  target,
}) => {
  const [chosenTransactionSet, setChosenSelectionSet] = useState<Array<Transaction>>([]);
  const [transactionArrIndex, setTransactionArrIndex] = useState<number>(0);

  /////////////////////////////////////////////////////////////////////////////
  // Lifecycle Events
  /////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (matchingTransactions.length === 0) {
      return;
    }
    setChosenSelectionSet(matchingTransactions[transactionArrIndex]);
  }, [matchingTransactions, transactionArrIndex]);

  /////////////////////////////////////////////////////////////////////////////
  // Event Handler Functions
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Ensure the new index is within bounds of the matching transaction sets
   * @param {Integer} newIndex The new index of which transaction set to use
   * @returns {Void}
   */
  function handleIndexChange(newIndex: number): void {
    if (newIndex < 0 || newIndex >= matchingTransactions.length) {
      return;
    }
    setTransactionArrIndex(newIndex);
  }

  /**
   * Handle Confirmation to clear the selected transactions
   * @returns {Void}
   */
  function handleConfirmation(): void {
    if (chosenTransactionSet.length === 0) {
      return;
    }

    chosenTransactionSet.forEach((txn) => {
      setTransactionCleared(txn);
    });

    onModalClose();
  }

  /**
   * Handle Modal close by clearing state
   * @returns {Void}
   */
  function onModalClose(): void {
    setChosenSelectionSet([]);
    setTransactionArrIndex(0);
    setModalOpened(false);
  }

  /////////////////////////////////////////////////////////////////////////////
  // Helper Functions
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Determine if the target is already reached. IE: The empty set matches
   * @returns {Boolean} true if the target was reached, false otherwise
   */
  function isTargetAlreadyReached(): boolean {
    return matchingTransactions.length === 1 && matchingTransactions[0].length === 0;
  }

  /**
   * Determine if the clear button should be visible
   * @returns {Boolean} True if there are any possible matches, false otherwise
   */
  function shouldShowClearButton(): boolean {
    // Nothing to do if the target matches or no matches were found
    if (isTargetAlreadyReached() || matchingTransactions.length == 0) {
      return false;
    }

    return true;
  }

  /////////////////////////////////////////////////////////////////////////////
  // Component Rendering
  /////////////////////////////////////////////////////////////////////////////

  if (!isOpen) {
    return null;
  }

  // Note: YNAB has their zIndex at 9998. Keep the current ynab modal from disappearing.
  return ReactDOM.createPortal(
    <div className="tk-modal-container" style={{ zIndex: 10000 }}>
      <div className="tk-modal-content tk-modal-stack tk-confirmation-modal">
        {/* Modal Header */}
        <div className="tk-align-self-start" style={{ fontSize: '1.5rem' }}>
          <p>{resources.modalHeader}</p>
        </div>

        {/* Modal Body */}
        <div>
          {isTargetAlreadyReached() ? (
            <p>{resources.targetReachedMessage}</p>
          ) : (
            <>
              {resources.currentClearedBalance} <strong>{formatCurrency(clearedTotal)}</strong>{' '}
              <br />
              Current Account Balance: <strong>{formatCurrency(clearedTotal + target)}</strong>
              <br />
              <br />
              Found <strong>{matchingTransactions.length}</strong> sets of uncleared transactions
              totaling to <strong>{formatCurrency(target)}</strong>.
              <TransactionsTable transactions={chosenTransactionSet} />
              <CarouselSelector
                onBack={() => handleIndexChange(transactionArrIndex - 1)}
                onForward={() => handleIndexChange(transactionArrIndex + 1)}
                currentSelectionIndex={transactionArrIndex}
                maxSelectionIndex={matchingTransactions.length}
              />
            </>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="tk-align-self-end">
          {shouldShowClearButton() && (
            <button className="tk-button tk-mg-r-05" onClick={handleConfirmation}>
              {resources.clearButtonText}
            </button>
          )}
          <button className="tk-button" onClick={onModalClose}>
            {resources.closeButtonText}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById(portalId)
  );
};
