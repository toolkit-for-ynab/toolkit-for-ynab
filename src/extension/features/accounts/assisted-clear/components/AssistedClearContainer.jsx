import React, { useState } from 'react';
import { generatePowerset, findMatchingSum } from '../assistedClearUtils';
import { AssistedClearModal } from './AssistedClearModal';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { stripCurrency } from 'toolkit/extension/utils/currency';
import PropTypes from 'prop-types';

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
    // Parse the input value for the converted normalized amount
    // If get an invalid number such as a string, 0 will be returned and will match ynab's functionality
    let convertedInputValue = stripCurrency(reconcileInputValue);

    let { selectedAccountId } = controllerLookup('accounts');
    let account = getEntityManager().getAccountById(selectedAccountId);
    let transactions = account.getTransactions();
    let { clearedBalance } = account.getAccountCalculation();

    // Get all the uncleared transactions
    let unclearedTransactions = transactions.filter(
      txn => txn.cleared && txn.isUncleared() && !txn.isTombstone
    );

    // Note: For credit cards, we'll automatically invert to follow ynab's behavior
    if (convertedInputValue > 0 && account.getAccountType() === 'CreditCard') {
      convertedInputValue *= -1;
    }
    let calculatedTarget = convertedInputValue - clearedBalance;

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
      <AssistedClearModal
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

ClearAssistantContainer.propTypes = {
  reconcileInputValue: PropTypes.string.isRequired,
};
