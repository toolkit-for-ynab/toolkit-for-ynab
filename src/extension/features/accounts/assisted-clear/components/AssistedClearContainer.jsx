import React, { useState } from 'react';
import { generatePowerset, findMatchingSum } from '../assistedClearUtils';
import { ClearAssistantModal } from './AssistedClearModal';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export const ClearAssistantContainer = ({ reconcileInputValue }) => {
  const [isModalOpened, setModalOpened] = useState(false);
  const [matchingTransactions, setMatchingTransactions] = useState([]);
  const [clearedTotal, setClearedTotal] = useState(0);
  const [target, setTarget] = useState(0);
  const [isToolTipVisible, setIsToolTipVisible] = useState(false);

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
    let { clearedBalance } = account.getAccountCalculation();

    // Get all the uncleared transactions
    let unclearedTransactions = transactions.filter(
      txn => txn.cleared && txn.isUncleared() && !txn.isTombstone
    );
    let calculatedTarget = Number(reconcileInputValue) * 1000 - clearedBalance;

    // Figure out which of the non reconciled transactions add up to our target
    let transactionPowerset = generatePowerset(unclearedTransactions);
    let possibleMatches = findMatchingSum(transactionPowerset, calculatedTarget);

    // Update context state
    setClearedTotal(clearedBalance);
    setTarget(calculatedTarget);
    setMatchingTransactions(possibleMatches);
    setModalOpened(true);
  };

  return (
    <>
      <ClearAssistantModal
        isOpen={isModalOpened}
        setModalOpened={setModalOpened}
        clearedTotal={clearedTotal}
        target={target}
        matchingTransactions={matchingTransactions}
      />
      <button
        className={`button-primary button${reconcileInputValue.length ? '' : ' button-disabled'}`}
        onClick={onSubmit}
        onMouseEnter={() => {
          setIsToolTipVisible(true);
        }}
        onMouseLeave={() => {
          setIsToolTipVisible(false);
        }}
      >
        Use Assisted Clear
      </button>
      {isToolTipVisible && (
        <span className="tk-tooltip">
          Determine if any combination of uncleared transactions adds up to the difference between
          the YNAB account balance and the actual account balance
        </span>
      )}
    </>
  );
};
