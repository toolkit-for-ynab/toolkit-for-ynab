import { Feature } from 'toolkit/extension/features/feature';
import { getAccountsService, isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { formatCurrency, stripCurrency } from 'toolkit/extension/utils/currency';

export class DefaultCCToCleared extends Feature {
  didClickRecord = false;

  shouldInvoke() {
    // grab the current account
    let { selectedAccount } = getAccountsService();
    return (
      // only activate if we're on an accounts page and it's a credit card account
      isCurrentRouteAccountsPage() &&
      selectedAccount &&
      selectedAccount.accountType === 'CreditCard'
    );
  }

  invoke() {
    document
      .querySelector('.js-record-payment')
      ?.addEventListener('click', this.applyNewButtonBehavior);
  }

  destroy() {
    this.didClickRecord = false;

    document
      .querySelector('.js-record-payment')
      ?.removeEventListener('click', this.applyNewButtonBehavior);
  }

  onRouteChanged() {
    // also check to see if we should invoke each time the user navigates to a new route
    // since shouldInvoke is only activated when the toolkit loads
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('button js-toolbar-buttons-overflow active')) {
      document
        .querySelector('.record-payment')
        ?.addEventListener('click', this.applyNewButtonBehavior);

      return;
    }

    // pull this out to avoid recalculation
    const didChangeInput = changedNodes.has('ynab-new-currency-input is-editing');

    // ideally i'd await completion of the existing event listener on the Record Payment button
    // but i don't see one registered consistently, so i set a state variable when the button is clicked and wait for the
    // transaction entry model to appear
    if (didChangeInput && this.didClickRecord) {
      // grab amounts from account
      let { selectedAccount } = getAccountsService();
      const clearedBal = selectedAccount.accountCalculation.clearedBalance;

      // we want to fill in the absolute value of cleared bal, since it's positive infow,
      // but the cleared balance is negative (it's a credit card)
      const absClearedBal = Math.abs(clearedBal);

      const inflowField = document.querySelector('.ynab-grid-cell-inflow input');

      // grab out the default value (Payment from budget)
      const ynabPaymentValue = stripCurrency(inflowField.value);
      // convert to real dollars
      const clearedBalToFill = formatCurrency(absClearedBal, true);
      // make sure we're not going overbudget
      if (ynabPaymentValue >= absClearedBal) {
        inflowField.value = clearedBalToFill;
        inflowField.dispatchEvent(new Event('change'));
        inflowField.dispatchEvent(new Event('blur'));
      }

      // reset state
      this.didClickRecord = false;
    }
  }

  applyNewButtonBehavior = () => {
    this.didClickRecord = true;
  };
}
