import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { setTransactionCleared } from '../assistedClearUtils';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { ASSISTED_CLEAR_MODAL_PORTAL } from '../index';
import PropTypes from 'prop-types';
import '../styles.scss';

export const AssistedClearModal = ({
  isOpen,
  setModalOpened,
  matchingTransactions,
  clearedTotal,
  target,
}) => {
  // There may be multiple sets that matched
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

  /**
   * For any matched transactions, toggle them to be cleared.
   * Reset state and close
   */
  let handleConfirmation = () => {
    if (chosenTransactionSet.length > 0) {
      chosenTransactionSet.forEach(txn => {
        setTransactionCleared(txn);
      });
    }
    onModalClose();
  };

  /**
   * Reset the state when the modal is closed
   */
  let onModalClose = () => {
    setChosenSelectionSet([]);
    setTransactionArrIndex(0);
    setModalOpened(false);
  };

  /**
   * Determine if the target is already reached. IE: The empty set matches
   * @returns {Boolean} true if the target was reached, false otherwise
   */
  let isTargetAlreadyReached = () => {
    return matchingTransactions.length === 1 && matchingTransactions[0].length === 0;
  };

  let showTransactionsTable = () => {
    return (
      <div className="ynab-table-5-col ynab-table tk-mg-b-1">
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
                <div className="ynab-table-col">
                  {txn.payee && txn.payee.name ? txn.payee.name : ''}
                </div>
                <div className="ynab-table-col">{txn.memo}</div>
                <div className="ynab-table-col amount-column">{formatCurrency(txn.amount)}</div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  let showTransactionSetSelector = () => {
    return (
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
    );
  };

  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    // Note: YNAB has their zIndex at 9998. Keep the current ynab modal from disappearing.
    <div className="tk-modal-container" style={{ zIndex: 10000 }}>
      <div className="tk-modal-content tk-modal-stack tk-confirmation-modal">
        {/* Modal Title */}
        <span className="tk-align-self-start" style={{ fontSize: '1.5rem' }}>
          Assisted Clear
        </span>
        {/* Modal Content */}
        {/* Result text appears only if we have any matching clearable matching transaction */}
        <p className="tk-align-self-start">
          {isTargetAlreadyReached() ? (
            "This account's cleared balance in YNAB matches your actual account balance. You're all set to finish reconciling!"
          ) : (
            <>
              YNAB Cleared Balance: <strong>{formatCurrency(clearedTotal)}</strong> <br />
              Current Account Balance: <strong>{formatCurrency(clearedTotal + target)}</strong>
              <br />
              <br />
              Found <strong>{matchingTransactions.length}</strong>{' '}
              {matchingTransactions.length === 1 ? 'set' : 'sets'} of uncleared transactions
              totaling to <strong>{formatCurrency(target)}</strong>.
            </>
          )}
        </p>
        {/* Show the transactions sets if there are any to select from */}
        {!isTargetAlreadyReached() && showTransactionsTable()}
        {!isTargetAlreadyReached() && showTransactionSetSelector()}

        {/* Modal Footer */}
        <div className="tk-align-self-end">
          {matchingTransactions.length > 0 &&
            chosenTransactionSet.length > 0 &&
            !isTargetAlreadyReached() && (
              <button className="tk-button tk-mg-r-05" onClick={handleConfirmation}>
                Clear Transactions
              </button>
            )}
          <button className="tk-button" onClick={onModalClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.getElementById(ASSISTED_CLEAR_MODAL_PORTAL)
  );
};

AssistedClearModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setModalOpened: PropTypes.func.isRequired,
  matchingTransactions: PropTypes.array.isRequired,
  clearedTotal: PropTypes.number.isRequired,
  target: PropTypes.number.isRequired,
};
