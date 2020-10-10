import React, { useContext, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { setTransactionCleared } from '../autoReconcileUtils';
import { AutoReconcileContext } from './AutoReconcileContext';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { AUTO_RECONCILE_MODAL_PORTAL } from '../index';
import '../styles.scss';

export const AutoReconcileConfirmationModal = ({ isOpen, onSubmit, onClose }) => {
  const store = useContext(AutoReconcileContext);
  const [target] = store.target;

  // There may be multiple sets that matched
  const [matchingTransactions] = store.matchingTransactions;

  // Keep track of the chosen transaction set
  const [chosenTransactionSet, setChosenSelectionSet] = useState([]);
  const [transactionArrIndex, setTransactionArrIndex] = useState(0);

  // Whenever the index changes, update the chosen transaction set
  useEffect(() => {
    if (matchingTransactions.length > 0) {
      setChosenSelectionSet(matchingTransactions[transactionArrIndex]);
    }
  }, [matchingTransactions, transactionArrIndex]);

  /**
   * Ensure the new index is within bounds of the matching transaction sets
   * @param {Integer} newIndex The new index of which transaction set to use
   */
  let handleIndexChange = newIndex => {
    if (newIndex >= 0 && newIndex < matchingTransactions.length) {
      setTransactionArrIndex(newIndex);
    }
  };

  let resetState = () => {
    setChosenSelectionSet([]);
    setTransactionArrIndex(0);
    store.resetState();
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
    resetState();
    onSubmit();
  };

  let onModalClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="tk-modal-container">
      <div className="tk-modal-content tk-modal-stack tk-confirmation-modal">
        <span className="tk-activity-header tk-align-self-start">Auto Reconcile</span>
        <p className="tk-align-self-start">
          {' '}
          Found <strong>{matchingTransactions.length}</strong>{' '}
          {matchingTransactions.length === 1 ? 'set' : 'sets'} of transactions totaling to{' '}
          <strong>{formatCurrency(target)}</strong>.
        </p>
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
          <button
            className="flaticon stroke left-2"
            onClick={() => handleIndexChange(transactionArrIndex - 1)}
          />
          <span className="tk-mg-x-1">
            {matchingTransactions.length === 0 ? 0 : transactionArrIndex + 1} of{' '}
            {matchingTransactions.length}
          </span>
          <button
            className="flaticon stroke right-2"
            onClick={() => handleIndexChange(transactionArrIndex + 1)}
          />
        </div>
        <div className="tk-align-self-end">
          {matchingTransactions.length > 0 && (
            <button className="tk-button tk-mg-r-1" onClick={handleAutoReconcileConfirmation}>
              Reconcile
            </button>
          )}
          <button className="tk-button" onClick={onModalClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.getElementById(AUTO_RECONCILE_MODAL_PORTAL)
  );
};
