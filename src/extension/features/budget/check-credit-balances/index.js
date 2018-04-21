import { Feature } from 'toolkit/extension/features/feature';
import { getAllBudgetMonthsViewModel, getCurrentBudgetDate, getCurrentBudgetMonth, getCurrentRouteName } from 'toolkit/extension/utils/ynab';

export class CheckCreditBalances extends Feature {
  budgetView = null;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    if (this.currentYear === 0 || this.currentMonth === 0) {
      this.onMonthChanged(getCurrentBudgetMonth());
    }

    if (this.inCurrentMonth()) {
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

  inCurrentMonth() { // check for current month or future month
    let today = new Date();
    let budgetDate = getCurrentBudgetDate();

    // check for current month or future month
    // must subtract 1 from budget month because the Date object is zero based.
    return budgetDate.month - 1 >= today.getMonth() && budgetDate.year >= today.getYear();
  }

  getDebtAccounts() {
    // After using Budget Quick Switch, budgetView needs to be reset to the new budget. The try catch construct is necessary
    // because this function can be called several times during the budget switch process.
    if (this.budgetView === null || this.budgetView.categoriesViewModel === null) {
      try {
        this.budgetView = getAllBudgetMonthsViewModel();
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

  processDebtAccounts(debtAccounts) {
    let foundButton = false;
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

        let available = 0;
        if (monthlyBudget) {
          available = monthlyBudget.balance;
        }

        // ensure that available is >= zero, otherwise don't update
        if (available >= 0) {
          // If cleared balance is positive, bring available to 0, otherwise
          // offset by the correct amount
          let difference = 0;
          if (balance > 0) {
            difference = (available * -1);
          } else {
            difference = ((available + balance) * -1);
          }

          if (!foundButton) {
            foundButton = _this.updateInspectorButton(a.name, difference);
          }

          if (balance < 0 && available !== (balance * -1)) {
            _this.updateRow(a.name);
            _this.updateInspectorStyle(a.name);
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

  updateInspectorButton(name, difference) {
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
          .click(this.updateCreditBalances);

        $('.inspector-quick-budget').append(button);
      }

      button
        .data('name', name)
        .data('difference', difference)
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

  updateCreditBalances() {
    if (ynabToolKit.options.QuickBudgetWarning) {
      // no need to confirm quick budget if zero budgeted
      if (!$('div.budget-table ul.budget-table-row.is-checked li.budget-table-cell-budgeted .currency').hasClass('zero')) {
        if (!window.confirm('Are you sure you want to budget this amount?')) { // eslint-disable-line no-alert
          return;
        }
      }
    }

    let name = $(this).data('name');
    let difference = $(this).data('difference');
    let debtPaymentCategories = $('.is-debt-payment-category.is-sub-category');

    $(debtPaymentCategories).each(function () {
      let accountName = $(this).find('.budget-table-cell-name div.button-truncate')
        .prop('title')
        .match(/.[^\n]*/)[0];
      if (accountName === name) {
        let input = $(this).find('.budget-table-cell-budgeted div.currency-input').click()
          .find('input');

        let oldValue = input.val();

        // If nothing is budgeted, the input will be empty
        oldValue = oldValue || 0;

        // YNAB stores values *1000 for decimal places, so just
        // multiple by 1000 to get the actual amount.
        let newValue = (ynab.unformat(oldValue) * 1000 + difference);

        // format the calculated value back to selected number format
        input.val(ynab.formatCurrency(newValue));

        if (ynabToolKit.options.QuickBudgetWarning === 0) {
          // only seems to work if the confirmation doesn't pop up?
          // haven't figured out a way to properly blur otherwise
          input.blur();
        }
      }
    });
  }
}
