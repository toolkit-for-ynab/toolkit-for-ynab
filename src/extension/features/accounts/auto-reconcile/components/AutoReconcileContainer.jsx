import React, { useState, useEffect, useRef } from 'react';
import { transactionReducer, generatePowerset, findMatchingSum } from '../autoReconcileUtils';
import { AutoReconcileConfirmationModal } from './AutoReconcileConfirmationModal';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export const AutoReconcileContainer = ({ reconcileInputValue }) => {
  const [isModalOpened, setModalOpened] = useState(false);
  const [matchingTransactions, setMatchingTransactions] = useState([]);
  const [clearedTotal, setClearedTotal] = useState(0);
  const [target, setTarget] = useState(0);

  /**
   * Figure out which transactions add up to a specific target
   * Update the state to update target and any matched transactions
   */
  let onSubmit = () => {
    // Exit early and do nothing if the input is invalid
    if (!reconcileInputValue.length || isNaN(reconcileInputValue)) {
      return;
    }
    let { selectedAccountId } = controllerLookup('accounts');
    let account = getEntityManager().getAccountById(selectedAccountId);
    let transactions = account.getTransactions();

    // Get all the uncleared transactions
    let unclearedTransactions = transactions.filter(
      txn => txn.cleared && txn.isUncleared() && !txn.isTombstone
    );

    // Sum up all cleared and reconciled transactions
    let reconciledTransactions = transactions.filter(
      txn => txn.cleared && !txn.isTombstone && (txn.isReconciled() || txn.isCleared())
    );
    let clearedTotal = reconciledTransactions.reduce(transactionReducer, 0);
    let calculatedTarget = Number(reconcileInputValue) * 1000 - clearedTotal;

    // Figure out which of the non reconciled transactions add up to our target
    let transactionPowerset = generatePowerset(unclearedTransactions);
    let possibleMatches = findMatchingSum(transactionPowerset, calculatedTarget);

    // Update context state
    setClearedTotal(clearedTotal);
    setTarget(calculatedTarget);
    setMatchingTransactions(possibleMatches);
    setModalOpened(true);
  };

  return (
    <>
      <AutoReconcileConfirmationModal
        isOpen={isModalOpened}
        setModalOpened={setModalOpened}
        clearedTotal={clearedTotal}
        target={target}
        matchingTransactions={matchingTransactions}
      />
      <button
        className={`button-primary button${reconcileInputValue.length ? '' : ' button-disabled'}`}
        onClick={onSubmit}
      >
        Use Assisted Clear
      </button>
    </>
  );
};
