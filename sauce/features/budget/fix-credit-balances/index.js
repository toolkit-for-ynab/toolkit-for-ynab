import { Feature } from 'toolkit/core/feature';
import * as toolkitHelper from 'toolkit/helpers/toolkit';

export class FixCreditBalances extends Feature {
  budgetView = null;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    if (this.currentYear === 0 || this.currentMonth === 0) {
      this.onMonthChanged(toolkitHelper.getCurrentBudgetMonth());
    }

    if (toolkitHelper.inCurrentMonth()) {
      let debtAccounts = this.getDebtAccounts();

      if (debtAccounts !== null) {
        this.processDebtAccounts(debtAccounts);
      }
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('navlink-budget active') ||
        changedNodes.has('budget-table-cell-available-div user-data') ||
        changedNodes.has('budget-inspector') ||
        changedNodes.has('budget-table-row is-sub-category is-debt-payment-category is-checked') ||
        changedNodes.has('budget-header-totals-cell-value user-data')) {
      this.invoke();
    }
  }

  onBudgetChanged() {
    this.budgetView = null;
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  getDebtAccounts() {
    // After using Budget Quick Switch, budgetView needs to be reset to the new budget. The try catch construct is necessary
    // because this function can be called several times during the budget switch process.
    if (this.budgetView === null || this.budgetView.categoriesViewModel === null) {
      try {
        this.budgetView = toolkitHelper.getAllBudgetMonthsViewModelResult();
      } catch (e) {
        return null;
      }
    }

    let categoryEntityId = this.budgetView
      .categoriesViewModel.debtPaymentMasterCategory.entityId;

    let debtAccounts = this.budgetView
      .categoriesViewModel.subCategoriesCollection
      .findItemsByMasterCategoryId(categoryEntityId);

    return debtAccounts || [];
  }

  quickBudgetCheckEnum = {
    CANCELED: 0,
    ACCEPTED: 1,
    NOT_SHOWN: 2
  }

  warnForQuickBudget() {
    if (ynabToolKit.options.QuickBudgetWarning) {
      // no need to confirm quick budget if zero budgeted
      if (! $('div.budget-table ul.budget-table-row.is-checked li.budget-table-cell-budgeted .currency').hasClass('zero')) {
        if (!confirm('Are you sure you want to budget this amount?')) { // eslint-disable-line no-alert
          return this.quickBudgetCheckEnum.CANCELED;
        }
        return this.quickBudgetCheckEnum.ACCEPTED;
      }
    }

    return this.quickBudgetCheckEnum.NOT_SHOWN;
  }

  processDebtAccounts(debtAccounts) {
    // // let foundButton = false;
    let _this = this;
    debtAccounts.forEach(function (a) {
      // Not sure why but sometimes on a reload (F5 or CTRL-R) of YNAB, the accountId field is null which if not handled
      // throws an error and kills the feature.
      if (a.accountId !== null) {
        let account = _this.budgetView
          .sidebarViewModel.accountCalculationsCollection
          .findItemByAccountId(a.accountId);
        let currentMonth = moment(ynabToolKit.shared.parseSelectedMonth()).format('YYYY-MM');
        let balance = account.clearedBalance + account.unclearedBalance;
        let monthlyBudget = _this.budgetView
          .monthlySubCategoryBudgetCalculationsCollection
          .findItemByEntityId('mcbc/' + currentMonth + '/' + a.entityId);
        let currentOutflows = 0;
        let available = 0;
        let carryoverBalance = 0;
        if (monthlyBudget) {
          available = monthlyBudget.balance;
          currentOutflows = monthlyBudget.cashOutflows;
          carryoverBalance = monthlyBudget.balancePreviousMonth;
        }

        // If cleared balance is positive, bring available to 0, otherwise
        // offset by the correct amount
        let difference = 0;

        let toBeBudgeted = 0;

        if (balance > 0) {
          difference = (available * -1);
          toBeBudgeted = (currentOutflows + carryoverBalance) * -1;
        } else {
          difference = ((available + balance));
          toBeBudgeted = (currentOutflows + balance + carryoverBalance) * -1;
        }

        if (difference !== 0) {
          let quickBudgetOutcome = _this.quickBudgetCheckEnum.NOT_SHOWN;

          // Check with the user if there is a possiblity of going over budget.
          if (difference > 0) {
            quickBudgetOutcome = _this.warnForQuickBudget();
            if (quickBudgetOutcome === _this.CANCELED) {
              return;
            }
          }

          let quickBudgetWarningShown = quickBudgetOutcome !== _this.quickBudgetCheckEnum.NOT_SHOWN;

          _this.updateCreditBalances(a.name, quickBudgetWarningShown, toBeBudgeted);
        }
      }
    });
  }

  updateCreditBalances(name, quickBudgetWarningShown, toBeBudgeted) {
    let debtPaymentCategories = $('.is-debt-payment-category.is-sub-category');

    $(debtPaymentCategories).each(function () {
      let accountName = $(this).find('.budget-table-cell-name div.button-truncate')
                               .prop('title')
                               .match(/.[^\n]*/)[0];

      if (accountName === name) {
        let currencyBox = $(this).find('.budget-table-cell-budgeted div.currency-input').click();
        let input = currencyBox.find('input');

        // format the calculated value back to selected number format
        input.val(ynab.formatCurrency(toBeBudgeted));

        if (!quickBudgetWarningShown) {
          // only seems to work if the confirmation doesn't pop up?
          // haven't figured out a way to properly blur otherwise
          input.blur();
        }

        // Disabling the lint warning "A function with a name starting with an uppercase letter should only be used as a constructor  new-cap"
        // Justifiction: The lint appears confused and thinks that we declared this function rather than it coming from JQuery
        // eslint-disable-next-line new-cap
        let enterKeyPress = $.Event('keypress');
        enterKeyPress.which = 13; // ENTER key

        currencyBox.trigger(enterKeyPress);

        // TODO: It would be nice if this didn't keep focust when it was modified.
      }
    });
  }
}
