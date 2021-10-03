import React, { useState } from 'react';
import { findMatchingTransactions } from '../reconcileAssistantUtils';
import { ReconcileAssistantModal } from './ReconcileAssistantModal';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { stripCurrency } from 'toolkit/extension/utils/currency';
import resources from '../resources';

interface ReconcileAssistantContainerProps {
  reconcileInputValue: string;
  portalId: string;
}

export const ReconcileAssistantContainer: React.FC<ReconcileAssistantContainerProps> = ({
  reconcileInputValue,
  portalId,
}) => {
  const [target, setTarget] = useState<number>(0);
  const [clearedTotal, setClearedTotal] = useState<number>(0);
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const [isToolTipVisible, setIsToolTipVisible] = useState<boolean>(false);
  const [matchingTransactions, setMatchingTransactions] = useState<Array<Array<Transaction>>>([]);

  function getCurrentAccount(): any {
    let { selectedAccountId } = controllerLookup('accounts');
    return getEntityManager().getAccountById(selectedAccountId);
  }

  /**
   * Figure out which transactions add up to a specific target
   * Update the state to update target and any matched transactions
   */
  let onSubmit = () => {
    // Parse the input value for the converted normalized amount
    // If get an invalid number such as a string, 0 will be returned and will match ynab's functionality
    let convertedInputValue: number = stripCurrency(reconcileInputValue);
    let account: any = getCurrentAccount();
    let { clearedBalance } = account.getAccountCalculation();

    // Note: For credit cards, we'll automatically invert to follow ynab's behavior
    if (convertedInputValue > 0 && account.getAccountType() === 'CreditCard') {
      convertedInputValue *= -1;
    }

    // The target should be the (targeted reconcile amount - current cleared balance)
    let calculatedTarget: number = convertedInputValue - clearedBalance;
    let possibleMatches: Array<Array<Transaction>> = findMatchingTransactions(
      account.getTransactions(),
      calculatedTarget
    );

    setClearedTotal(clearedBalance);
    setTarget(calculatedTarget);
    setMatchingTransactions(possibleMatches);
    setModalOpened(true);
  };

  return (
    <>
      <ReconcileAssistantModal
        portalId={portalId}
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
        {resources.useReconcileAssistantText}
      </button>

      {isToolTipVisible && <span className="tk-tooltip">{resources.tooltipInstructions}</span>}
    </>
  );
};
