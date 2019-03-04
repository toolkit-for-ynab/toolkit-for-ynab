import { Feature } from 'toolkit/extension/features/feature';
import {
  getSelectedMonth,
  getEntityManager,
  isCurrentRouteBudgetPage,
} from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';

export class CheckCreditBalances extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    const today = new ynab.utilities.DateWithoutTime();

    if (today.equalsByMonth(getSelectedMonth())) {
      this.processDebtAccounts();
    } else {
      $('.toolkit-rectify-difference').remove();
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (
      changedNodes.has('budget-number user-data') ||
      changedNodes.has('navlink-budget active') ||
      changedNodes.has('budget-inspector') ||
      changedNodes.has('budget-table-row is-sub-category is-debt-payment-category is-checked') ||
      changedNodes.has('budget-header-totals-cell-value user-data')
    ) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  getDebtCategories() {
    const entityManager = getEntityManager();
    const debtMasterCategory = entityManager.masterCategoriesCollection.find(c => {
      return c.get('internalName') === ynab.constants.InternalCategories.DebtPaymentMasterCategory;
    });

    const debtAccounts = getEntityManager()
      .getAllSubCategories()
      .filter(c => {
        return (
          !c.get('isTombstone') && c.get('masterCategoryId') === debtMasterCategory.get('entityId')
        );
      });

    return debtAccounts || [];
  }

  processDebtAccounts() {
    const debtCategories = this.getDebtCategories();
    let foundButton = false;

    debtCategories.forEach(debtCategory => {
      const {
        accountCalculationsCollection,
        monthlySubCategoryBudgetCalculationsCollection,
      } = getEntityManager();

      // Not sure why but sometimes on a reload (F5 or CTRL-R) of YNAB, the accountId field
      // is null which if not handled throws an error and kills the feature.
      if (debtCategory.accountId !== null) {
        const debtCategoryId = debtCategory.get('entityId');
        const debtAccountId = debtCategory.get('accountId');

        const currentMonth = getSelectedMonth().format('YYYY-MM');
        const monthlyBudget = monthlySubCategoryBudgetCalculationsCollection.findItemByEntityId(
          `mcbc/${currentMonth}/${debtCategoryId}`
        );
        const calculation = accountCalculationsCollection.find(
          c => c.get('accountId') === debtAccountId
        );
        if (!calculation) {
          return;
        }

        const balance = calculation.clearedBalance + calculation.unclearedBalance;
        let available = 0;
        if (monthlyBudget) {
          available = monthlyBudget.balance;
        }

        // ensure that available is >= zero, otherwise don't update
        if (available >= 0) {
          // If cleared balance is positive, bring available to 0, otherwise offset by the correct amount
          let difference = 0;
          if (balance > 0) {
            difference = -available;
          } else {
            difference = -(available + balance);
          }

          if (!foundButton) {
            foundButton = this.updateInspectorButton(debtCategory.name, difference);
          }

          if (balance < 0 && available !== balance * -1) {
            this.addWarning(debtCategoryId);
          } else {
            this.removeWarning(debtCategoryId);
          }
        }
      }
    });

    if (!foundButton) {
      $('.toolkit-rectify-difference').remove();
    }
  }

  addWarning(debtCategoryId) {
    const debtRowElement = document.querySelector(`[data-entity-id="${debtCategoryId}"]`);
    if (debtRowElement) {
      debtRowElement.setAttribute('data-toolkit-pif-assist', 'true');
    }

    const inspectorElement = document.querySelector('.budget-inspector');
    if (inspectorElement) {
      inspectorElement.setAttribute('data-toolkit-pif-assist', 'true');
    }
  }

  removeWarning(debtCategoryId) {
    const debtRowElement = document.querySelector(`[data-entity-id="${debtCategoryId}"]`);
    if (debtRowElement) {
      debtRowElement.removeAttribute('data-toolkit-pif-assist');
    }

    const inspectorElement = document.querySelector('.budget-inspector');
    if (inspectorElement) {
      inspectorElement.removeAttribute('data-toolkit-pif-assist', 'true');
    }
  }

  updateInspectorButton(name, difference) {
    let inspectorName = $('.inspector-category-name.user-data')
      .text()
      .trim();

    if (name && name === inspectorName) {
      let fDifference = formatCurrency(difference);
      let positive = '';
      if (ynab.unformat(difference) >= 0) {
        positive = '+';
      }

      let button = $('.toolkit-rectify-difference');
      if (!button.length) {
        button = $('<a>', {
          class: 'budget-inspector-button toolkit-rectify-difference',
        })
          .css({
            'text-align': 'center',
            'line-height': '30px',
            display: 'block',
            cursor: 'pointer',
          })
          .click(this.updateCreditBalances);

        $('.inspector-quick-budget').append(button);
      }

      button
        .data('name', name)
        .data('difference', difference)
        .empty()
        .append(l10n('toolkit.checkCreditBalances', 'Rectify Difference:'))
        .append(' ' + positive)
        .append(
          $('<strong>', { class: 'user-data', title: fDifference }).append(
            $('<span>', { class: 'user-data currency zero' }).text(formatCurrency(difference))
          )
        );

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
      if (
        !$(
          'div.budget-table ul.budget-table-row.is-checked li.budget-table-cell-budgeted .currency'
        ).hasClass('zero')
      ) {
        if (!window.confirm('Are you sure you want to budget this amount?')) {
          // eslint-disable-line no-alert
          return;
        }
      }
    }

    let name = $(this).data('name');
    let difference = $(this).data('difference');
    let debtPaymentCategories = $('.is-debt-payment-category.is-sub-category');

    $(debtPaymentCategories).each(function() {
      let accountName = $(this)
        .find('.budget-table-cell-name div.button-truncate')
        .prop('title')
        .match(/.[^\n]*/)[0];
      if (accountName === name) {
        let input = $(this)
          .find('.budget-table-cell-budgeted div.ynab-new-currency-input')
          .click()
          .find('input');

        let oldValue = input.val();

        // If nothing is budgeted, the input will be empty
        oldValue = oldValue || 0;

        // YNAB stores values *1000 for decimal places, so just
        // multiple by 1000 to get the actual amount.
        let newValue = ynab.unformat(oldValue) * 1000 + difference;

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
