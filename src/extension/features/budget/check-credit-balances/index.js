import { Feature } from 'toolkit/extension/features/feature';
import {
  getBudgetService,
  isCurrentMonthSelected,
  isCurrentRouteBudgetPage,
} from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEmberView } from 'toolkit/extension/utils/ember';

export class CheckCreditBalances extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage() && isCurrentMonthSelected();
  }

  invoke() {
    this.addRectifyDifferenceButton();
    this.addToolkitEmberHook('budget-table-row', 'didRender', this.checkCategoryForDifference);
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('budget-inspector-button')) {
      this.addRectifyDifferenceButton();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }

  destroy() {
    document.querySelectorAll('#tk-rectify-difference').forEach((el) => el.remove());
    document
      .querySelectorAll('[data-tk-pif-assist]')
      .forEach((el) => el.removeAttribute('data-tk-pif-assist'));
  }

  addRectifyDifferenceButton() {
    if (!isCurrentMonthSelected()) return;

    const inspectorElement = document.querySelector('.budget-inspector');
    if (!inspectorElement) return;

    const buttonDivExists = document.querySelector('#tk-rectify-difference');
    if (buttonDivExists) buttonDivExists.remove();

    // We only want to add the button if one category is selected. The budget inspector only sets activeCategory if one category is selected.
    const category = getBudgetService().activeCategory;
    if (!category) return;
    if (!category.isCreditCardPaymentCategory) return;

    const difference = this.calculateDifference(category);
    // If there is a difference, add warning. If available is less than 0, YNAB will show underfunded warning so we don't need to add ours.
    if (difference && category.available >= 0)
      inspectorElement.setAttribute('data-tk-pif-assist', 'true');
    else inspectorElement.removeAttribute('data-tk-pif-assist');

    const formattedDifference =
      difference >= 0 ? `+${formatCurrency(difference)}` : formatCurrency(difference);
    const categoryElement = document.querySelector(`[data-entity-id="${category.categoryId}"]`);
    const currencyInput = categoryElement.querySelector('.ynab-new-currency-input');
    if (!currencyInput) return;
    const input = currencyInput.querySelector('input');
    const rectifyDifference = (event) => {
      currencyInput.click();
      input.value = ynab.formatCurrency(category.budgeted + difference);
      input.blur();
      event.currentTarget.setAttribute('disabled', true); // Disable button once it's clicked.
    };
    const buttonDiv = this.createButton(formattedDifference, rectifyDifference);

    const quickBudget = document.querySelector('.inspector-quick-budget');
    if (!quickBudget) return;
    const quickBudgetButtons = quickBudget.querySelector('.option-groups');
    if (quickBudgetButtons) quickBudgetButtons.appendChild(buttonDiv);

    const button = document.querySelector('#tk-rectify-difference-btn');
    if (!button) return;
    if (difference) button.removeAttribute('disabled');
    else button.setAttribute('disabled', true);
  }

  checkCategoryForDifference(categoryElement) {
    if (!isCurrentMonthSelected()) return;

    const category = getEmberView(categoryElement.id).category;
    if (!category) return;
    if (!category.isCreditCardPaymentCategory) return;

    const difference = this.calculateDifference(category);
    const categoryAccountId = category.subCategoryAccount?.entityId;
    const accountBudgetLabel = categoryAccountId
      ? document.querySelector(`a[data-account-id='${categoryAccountId}']`)
      : undefined;

    if (difference) {
      // Upsert the indicator on the accounts nav
      let mismatchIndicator = accountBudgetLabel?.querySelector('.cc-budget-mismatch');
      if (mismatchIndicator) {
        mismatchIndicator.style.display = 'inline';
      } else if (accountBudgetLabel) {
        const accountNameElem = accountBudgetLabel.querySelector('.nav-account-name');
        $(accountNameElem).append(this.alertIcon());
      }
      // set the background in the budget nav
      categoryElement.setAttribute('data-tk-pif-assist', 'true');
    } else {
      // hide the indicator in the accounts nav
      accountBudgetLabel?.querySelectorAll('.cc-budget-mismatch').forEach((elem) => {
        elem.style.display = 'none';
      });
      // unset the background in the budget nav
      categoryElement.removeAttribute('data-tk-pif-assist');
    }
  }

  alertIcon() {
    return $(`
      <svg class="ynab-new-icon view-button-icon cc-budget-mismatch">
        <title>Account balance does not match available funds in budget.</title>
        <use href="#icon_sprite_general_warning"></use>
      </svg>
    `);
  }

  calculateDifference(category) {
    const balance = category.subCategoryAccountBalance;
    const available = category.available;
    return balance > 0 ? -available : -(available + balance); // If balance is positive, bring available to 0. Otherwise offset by the correct amount.
  }

  // Returns an element that is structured like the other budget inspector buttons.
  createButton(formattedDifference, onClick) {
    const buttonAmount = document.createElement('span');
    buttonAmount.setAttribute('class', 'user-data currency zero');
    buttonAmount.innerText = formattedDifference;

    const buttonContent = document.createElement('strong');
    buttonContent.setAttribute('class', 'user-data');
    buttonContent.setAttribute('title', formattedDifference);
    buttonContent.appendChild(buttonAmount);

    const buttonContentDiv = document.createElement('div');
    buttonContentDiv.appendChild(buttonContent);

    const buttonText = document.createElement('div');
    buttonText.innerText = 'Rectify Difference';

    const button = document.createElement('button');
    button.setAttribute('id', 'tk-rectify-difference-btn');
    button.setAttribute('class', 'budget-inspector-button');
    button.addEventListener('click', onClick);
    button.appendChild(buttonText);
    button.appendChild(buttonContentDiv);

    const buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('id', 'tk-rectify-difference');
    buttonDiv.appendChild(button);

    return buttonDiv;
  }
}
