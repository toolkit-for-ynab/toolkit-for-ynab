import React, { useContext, useEffect, useState } from 'react';
import { setTransactionCleared } from '../autoReconcileUtils';
import { AutoReconcileContext } from './AutoReconcileContext';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import '../styles.scss';
import { setState } from 'expect/build/jestMatchersObject';

export const AutoReconcileConfirmationModal = ({ isOpen, onSubmit, onClose }) => {
  const store = useContext(AutoReconcileContext);
  const [target, setTarget] = store.target;
  const [reconcileAmount, setReconcileAmount] = store.reconcileAmount;

  // There may be multiple sets that matched
  const [matchingTransactions, setMatchingTransactions] = store.matchingTransactions;

  // Keep track of the chosen one
  const [chosenTransactionSet, setChosenSelectionSet] = useState([]);
  const [transactionArrIndex, setTransactionArrIndex] = useState(0);

  // On initial render, select the first one.
  useEffect(() => {
    if (matchingTransactions.length > 0) {
      if (transactionArrIndex >= 0 && transactionArrIndex < matchingTransactions.length) {
        setChosenSelectionSet(matchingTransactions[transactionArrIndex]);
      }
    } else {
      // Handle nothing found
    }
  }, [matchingTransactions, transactionArrIndex]);

  if (!isOpen) {
    return null;
  }

  let handleIndexChange = newIndex => {
    if (newIndex >= 0 && newIndex < matchingTransactions.length) {
      setTransactionArrIndex(newIndex);
    }
  };

  /**
   * For any matched transactions, toggle them to be cleared.
   * Reset state and close
   */
  let handleAutoReconcileConfirmation = () => {
    if (chosenTransactionSet.length > 0) {
      chosenTransactionSet.forEach(txn => {
        setTransactionCleared(txn);
      });
    }
    setChosenSelectionSet([]);
    setTransactionArrIndex(0);
    store.resetState();
    onSubmit();
  };

  let onModalClose = () => {
    setChosenSelectionSet([]);
    setTransactionArrIndex(0);
    store.resetState();
    onClose();
  };

  return (
    <div className="tk-modal-container">
      <div className="tk-modal-content tk-modal-stack tk-confirmation-modal">
        <span className="tk-activity-header tk-align-self-start">Auto Reconcile</span>
        <div className="ynab-table-5-col ynab-table has-scrollbar tk-mg-b-1">
          <div className="ynab-table-head">
            <div className="ynab-table-col">Account</div>
            <div className="ynab-table-col">Date</div>
            <div className="ynab-table-col">Payee</div>
            <div className="ynab-table-col">Memo</div>
            <div className="ynab-table-col amount-column">Amount</div>
          </div>
          <div className="ynab-table-body">
            {chosenTransactionSet.length > 0 &&
              chosenTransactionSet.map((txn, index) => (
                <div key={index} className="ynab-table-row">
                  <div className="ynab-table-col">{txn.account.accountName}</div>
                  <div className="ynab-table-col">
                    {ynab.YNABSharedLib.dateFormatter.formatDate(txn.date.getUTCTime())}
                  </div>
                  <div className="ynab-table-col">{txn.payee.name}</div>
                  <div className="ynab-table-col">{txn.memo}</div>
                  <div className="ynab-table-col amount-column">{formatCurrency(txn.amount)}</div>
                </div>
              ))}
          </div>
        </div>
        <div className="tk-mg-b-1">
          <button onClick={() => handleIndexChange(transactionArrIndex - 1)}> Previous </button>
          <span className="tk-mg-x-1">
            {transactionArrIndex + 1} of {matchingTransactions.length} sets
          </span>
          <button onClick={() => handleIndexChange(transactionArrIndex + 1)}> Next </button>
        </div>
        <div className="tk-align-self-end">
          <button
            className="button button-primary button tk-mg-r-1"
            onClick={handleAutoReconcileConfirmation}
          >
            Reconcile
          </button>
          <button className="button button-primary button" onClick={onModalClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
