import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { formatCurrency, stripCurrency } from 'toolkit/extension/utils/currency';

export class DefaultCCToCleared extends Feature {
  constructor() {
    super();

    // TODO add option to create a modal with a button to choose which value to insert
    // TODO (ref https://github.com/toolkit-for-ynab/toolkit-for-ynab/issues/2171#issuecomment-1024907005)
    this.didClickRecord = false;
  }

  shouldInvoke() {
    // grab the current account
    let { selectedAccount } = controllerLookup('accounts');
    return (
      // only activate if we're on an accounts page and it's a credit card account
      isCurrentRouteAccountsPage() &&
      selectedAccount &&
      selectedAccount.accountType === 'CreditCard'
    );
  }

  onRouteChanged() {
    // also check to see if we should invoke each time the user navigates to a new route
    // since shouldInvoke is only activated when the toolkit loads
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    // pull this out to avoid recalculation
    const didChangeInput = changedNodes.has('ynab-new-currency-input is-editing');
    // ideally i'd await completion of the existing event listener on the Record Payment button
    // but i don't see one registered consistently, so i set a state variable when the button is clicked and wait for the
    // transaction entry model to appear
    if (didChangeInput && this.didClickRecord) {
      // grab amounts from account
      let { selectedAccount } = controllerLookup('accounts');
      const clearedBal = selectedAccount.accountCalculation.clearedBalance;
      // const unclearedBal = selectedAccount.accountCalculation.unclearedBalance;
      // const workingBal = clearedBal + unclearedBal;

      // we want to fill in the absolute value of cleared bal, since it's positive infow,
      //   but the cleared balance is negative (it's a credit card)
      const absClearedBal = Math.abs(clearedBal);

      // there's probably a better way to find the input field but i've never used jquery before so here we are
      // find inflow and outflow divs on the transaction entry row that
      //   appears after the user presses the Record Payment button
      // need to start with the ynab-new-currency-input class since existing transactions will also have
      //   the ynab-grid-cell-inflow class
      const currencyEntryFields = $('.ynab-new-currency-input');
      var inflowField;
      // look at each div and see which one is the inflow
      currencyEntryFields.each((_, div) => {
        if (div.parentElement.classList.contains('ynab-grid-cell-inflow')) {
          // then find the child that's the actual text input object
          // .find returns a list with one object inside
          inflowField = $(div).find('.ember-text-field')[0];
        }
      });
      // grab out the default value (Payment from budget)
      const ynabPaymentValue = stripCurrency(inflowField.value);
      // convert to real dollars
      const clearedBalToFill = formatCurrency(absClearedBal, true);
      // make sure we're not going overbudget
      if (ynabPaymentValue >= absClearedBal) {
        inflowField.value = clearedBalToFill;
      }

      // reset state
      this.didClickRecord = false;
    }
  }

  invoke() {
    this.applyNewButtonBehavior();
  }

  destroy() {
    this.didClickRecord = false;
  }

  applyNewButtonBehavior() {
    const recordPaymentButton = $('.js-record-payment');
    recordPaymentButton.each((_, button) => {
      button.addEventListener('click', () => {
        this.didClickRecord = true;
      });
    });
  }
}
