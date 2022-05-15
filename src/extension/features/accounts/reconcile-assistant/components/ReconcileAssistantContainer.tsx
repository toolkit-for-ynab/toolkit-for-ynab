import React, { useState } from 'react';
import resources from '../resources';
import { ReconcileAssistantModal } from './ReconcileAssistantModal';
import { getSelectedAccount } from 'toolkit/extension/utils/ynab';
import { stripCurrency } from 'toolkit/extension/utils/currency';

interface ReconcileAssistantContainerProps {
  reconcileInputValue: string;
  portalId: string;
}

export function ReconcileAssistantContainer({
  reconcileInputValue,
  portalId,
}: ReconcileAssistantContainerProps) {
  const [target, setTarget] = useState(0);
  const [clearedTotal, setClearedTotal] = useState(0);
  const [isModalOpened, setModalOpened] = useState(false);
  const [isToolTipVisible, setIsToolTipVisible] = useState(false);
  const [transactions, setTransactions] = useState<Array<Transaction>>([]);

  /**
   * Get the current account on this page
   * @returns {Account} The current account
   */

  /**
   * Figure out which transactions add up to a specific target
   * Update the state to update target and any matched transactions
   */
  const handleSubmit = () => {
    // Parse the input value for the converted normalized amount
    // If we get an invalid number such as a string, 0 will be returned and will match ynab's functionality
    let convertedInputValue: number = stripCurrency(reconcileInputValue);
    const account = getSelectedAccount();
    const { clearedBalance } = account.getAccountCalculation();

    // Note: For credit cards, we'll automatically invert to follow ynab's behavior
    if (convertedInputValue > 0 && account.getAccountType() === 'CreditCard') {
      convertedInputValue *= -1;
    }

    setTransactions(account.getTransactions());
    setClearedTotal(clearedBalance);

    // The target should be the (targeted reconcile amount - current cleared balance)
    setTarget(convertedInputValue - clearedBalance);
    setModalOpened(true);
  };

  return (
    <>
      <button
        className={`button-primary button${reconcileInputValue.length ? '' : ' button-disabled'}`}
        onClick={handleSubmit}
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

      <ReconcileAssistantModal
        portalId={portalId}
        isOpen={isModalOpened}
        setModalOpened={setModalOpened}
        transactions={transactions}
        clearedTotal={clearedTotal}
        target={target}
      />
    </>
  );
}
