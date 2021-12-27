import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import {
  generatePowerset,
  getUnclearedTransactions,
  findMatchingSum,
} from '../reconcileAssistantUtils';
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
  clearedTotal: number;
  target: number;
  transactions: Array<Transaction>;
}

export const ReconcileAssistantModal: React.FC<ReconcileAssistantModalProps> = ({
  portalId,
  isOpen,
  setModalOpened,
  clearedTotal,
  target,
  transactions,
}) => {
  const [transactionPowerset, setTransactionPowerset] = useState<Array<Array<Transaction>>>([]);
  const [matchingTransactions, setMatchingTransactions] = useState<Array<Array<Transaction>>>([]);
  const [chosenTransactionSet, setChosenSelectionSet] = useState<Array<Transaction>>([]);
  const [transactionArrIndex, setTransactionArrIndex] = useState<number>(0);

  /////////////////////////////////////////////////////////////////////////////
  // Lifecycle Events
  /////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    let unclearedTransactions: Array<Transaction> = getUnclearedTransactions(transactions);
    setTransactionPowerset(generatePowerset(unclearedTransactions));
  }, [isOpen, transactions]);

  useEffect(() => {
    setMatchingTransactions(findMatchingSum(transactionPowerset, target));
  }, [isOpen, transactionPowerset, target]);

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
    setTransactionPowerset([]);
    setMatchingTransactions([]);
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
   * The matching transaction result string
   * @param numMatches The number of matches
   * @param target The target number
   * @returns {string} The text of the matching result
   */
  function matchingTransactionResult(numMatches: number, target: number): string {
    let summary: string = resources.matchingTransactionsSummary;
    let unit: string = resources.setsPlural;
    if (matchingTransactions.length === 1) {
      unit = resources.setsSingular;
    }
    let result: string = matchingTransactions.length.toString() + ' ' + unit;
    summary = summary.replace('{0}', result);
    summary = summary.replace('{1}', formatCurrency(target));
    return summary;
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

  /**
   * Get the modal content body
   * @returns The modal content body
   */
  let modalBodyContent = () => {
    if (isTargetAlreadyReached()) {
      return <p>{resources.targetReachedMessage}</p>;
    }

    return (
      <>
        <div>
          <p>
            {resources.currentClearedBalance} <strong>{formatCurrency(clearedTotal)}</strong>
            <br />
            {resources.currentAccountBalance}{' '}
            <strong>{formatCurrency(clearedTotal + target)}</strong>
            <br />
            <br />
            {matchingTransactionResult(matchingTransactions.length, target)}
          </p>
        </div>
        <TransactionsTable transactions={chosenTransactionSet} />
        {matchingTransactions.length > 0 && (
          <div style={{ alignSelf: 'center' }}>
            <CarouselSelector
              onBack={() => handleIndexChange(transactionArrIndex - 1)}
              onForward={() => handleIndexChange(transactionArrIndex + 1)}
              currentSelectionIndex={transactionArrIndex}
              maxSelectionIndex={matchingTransactions.length}
            />
          </div>
        )}
      </>
    );
  };

  // Note: YNAB has their zIndex at 9998. Keep the current ynab modal from disappearing.
  return ReactDOM.createPortal(
    <div className="tk-modal-container" style={{ zIndex: 10000 }}>
      <div className="tk-modal-content tk-modal-stack tk-confirmation-modal">
        {/* Modal Header */}
        <div className="tk-align-self-start" style={{ fontSize: '1.5rem' }}>
          <p>{resources.modalHeader}</p>
        </div>

        {/* Modal Body */}
        <div className="tk-reconcile-assistant-modal-body">{modalBodyContent()}</div>

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
