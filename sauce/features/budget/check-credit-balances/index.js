import { Feature } from 'toolkit/core/feature';
import * as toolkitHelper from 'toolkit/helpers/toolkit';

export class CheckCreditBalances extends Feature {
  budgetView = null;

  enumRectifyModes = {
    NONE: 0,
    HIGHLIGHT: 1,
    RECTIFY: 2,
    RECTIFY_PIF_ONLY: 3
  }

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
    } else {
      $('.toolkit-rectify-difference').remove();
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

  getCheckCardbalancesMode() {
    switch (ynabToolKit.options.CheckCreditBalances) {
      case 'highlight':
        return this.enumRectifyModes.HIGHLIGHT;
      case 'rectify':
        return this.enumRectifyModes.RECTIFY;
      case 'rectifyPIF':
        return this.enumRectifyModes.RECTIFY_PIF_ONLY;
      default:
        return this.enumRectifyModes.NONE;
    }
  }

  processDebtAccounts(debtAccounts) {
    let foundButton = false;
    let _this = this;

    let rectifyMode = this.getCheckCardbalancesMode();

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

        // ensure that available is >= zero if we are highlighting
        let mightNeedToHighlight = available >= 0 && rectifyMode === _this.enumRectifyModes.HIGHLIGHT;

        // Check for the string for #PIP in order to emnable automatic rectification only on those accounts in the PIF only mode
        let nameContainsPIP = a.name.search(/#pif/i) !== -1;

        // We alwasy rectify to get things exact, we rectify any time the difference isn't zero
        let mightNeedToRectify = (rectifyMode === _this.enumRectifyModes.RECTIFY) ||
                                 (rectifyMode === _this.enumRectifyModes.RECTIFY_PIF_ONLY && nameContainsPIP);

        if (mightNeedToHighlight || mightNeedToRectify) {
          // If cleared balance is positive, bring available to 0, otherwise
          // offset by the correct amount
          let difference = 0;

          // Calculate the balance now so it isn't dependent on reading the budget later and applying the difference
          // which can lead to some wierd beahvior with auto rectify becuase that value can potentially change somehow
          let toBeBudgeted = 0;

          if (balance > 0) {
            difference = (available * -1);
            toBeBudgeted = (currentOutflows + carryoverBalance) * -1;
          } else {
            difference = ((available + balance));
            toBeBudgeted = (currentOutflows + balance + carryoverBalance) * -1;
          }

          switch (rectifyMode) {
            case (_this.enumRectifyModes.HIGHLIGHT):
              foundButton |= _this.updateInspectorButton(a.name, difference, toBeBudgeted);

              if (available !== (balance * -1)) {
                _this.updateRow(a.name);
                _this.updateInspectorStyle(a.name);
              }
              break;
            case (_this.enumRectifyModes.RECTIFY):
            case (_this.enumRectifyModes.RECTIFY_PIF_ONLY):
              if (difference !== 0) {
                // If rectifying automatically, just submit the value.
                // This ignores the quick budget option since it isn't a quick budget button
                _this.updateCreditBalances(a.name, toBeBudgeted, true, false);
              }

              break;
          }
        }
      }
    });

    if (!foundButton) {
      $('.toolkit-rectify-difference').remove();
    }
  }

  updateRow(name) {
    let rows = $('.is-sub-category.is-debt-payment-category');
    rows.each(function () {
      let accountName = $(this).find('.budget-table-cell-name div.button-truncate')
                               .prop('title')
                               .match(/.[^\n]*/)[0]; // strip the Note string

      if (name === accountName) {
        let categoryBalance = $(this).find('.budget-table-cell-available-div .user-data.currency');
        categoryBalance.removeClass('positive zero');
        if (!categoryBalance.hasClass('negative')) {
          $(this).find('.budget-table-cell-available-div .user-data.currency').addClass('cautious toolkit-pif-cautious');
        }
      }
    });
  }

  updateInspectorStyle(name) {
    let inspectorName = $('.inspector-category-name.user-data').text().trim();
    if (name === inspectorName) {
      let inspectorBalance = $('.inspector-overview-available .user-data .user-data.currency');
      inspectorBalance.removeClass('positive zero');
      if (!inspectorBalance.hasClass('negative')) {
        $('.inspector-overview-available .user-data .user-data.currency, .inspector-overview-available dt').addClass('cautious toolkit-pif-cautious');
      }
    }
  }

  updateInspectorButton(name, difference, toBeBudgeted) {
    let inspectorName = $('.inspector-category-name.user-data').text().trim();

    if (name && name === inspectorName) {
      let fDifference = ynabToolKit.shared.formatCurrency(difference);
      let positive = '';
      if (ynab.unformat(difference) >= 0) {
        positive = '+';
      }

      let button = $('.toolkit-rectify-difference');
      if (!button.length) {
        button = $('<a>', {
          class: 'budget-inspector-button toolkit-rectify-difference'
        })
          .css({
            'text-align': 'center',
            'line-height': '30px',
            display: 'block',
            cursor: 'pointer'
          })
          .click(this.updateCreditBalancesWithButton);

        $('.inspector-quick-budget').append(button);
      }

      button
        .data('name', name)
        .data('toBeBudgeted', toBeBudgeted)
        .empty()
        .append(((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.checkCreditBalances']) || 'Rectify Difference:'))
        .append(' ' + positive)
        .append($('<strong>', { class: 'user-data', title: fDifference })
          .append(ynabToolKit.shared.appendFormattedCurrencyHtml($('<span>', { class: 'user-data currency zero' }), difference)));

      if (difference !== 0) {
        button.removeAttr('disabled');
      } else {
        button.attr('disabled', true);
      }

      return true;
    }
    return false;
  }

  updateCreditBalances(name, toBeBudgeted, submitValue, quickBudgetWarningShown) {
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

        if (submitValue) {
          // After entering the value, simulate the user pressing enter in order to get the value to go through.

          // Disabling the lint warning "A function with a name starting with an uppercase letter should only be used as a constructor  new-cap"
          // Justifiction: The lint appears confused and thinks that we declared this function rather than it coming from JQuery
          // eslint-disable-next-line new-cap
          let enterKeyPress = $.Event('keypress');
          enterKeyPress.which = 13; // ENTER key

          currencyBox.trigger(enterKeyPress);

          // Uncheck the credit card so it isn't checked since it probably wasn't befor the change
          $(this).find('.budget-table-cell-checkbox div.ynab-checkbox').click();

          // TODO: Is there a way that the currency-input is no longer selected?
        }
      }
    });
  }

  updateCreditBalancesWithButton() {
    let quickBudgetWarningShown = false;

    if (ynabToolKit.options.QuickBudgetWarning) {
      // no need to confirm quick budget if zero budgeted
      if (! $('div.budget-table ul.budget-table-row.is-checked li.budget-table-cell-budgeted .currency').hasClass('zero')) {
        if (!confirm('Are you sure you want to budget this amount?')) { // eslint-disable-line no-alert
          return;
        }
        quickBudgetWarningShown = true;
      }
    }

    let name = $(this).data('name');
    let toBeBudgeted = $(this).data('toBeBudgeted');

    this.updateCreditBalances(name, toBeBudgeted, false, quickBudgetWarningShown);
  }
}
