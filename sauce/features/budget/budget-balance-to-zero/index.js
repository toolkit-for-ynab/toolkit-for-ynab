import { Feature } from 'toolkit/core/feature';
import * as toolkitHelper from 'toolkit/helpers/toolkit';

export class BudgetBalanceToZero extends Feature {
  attachedObserver = false
  budgetView = null

  shouldInvoke = () => {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke = () => {
    if (!this.attachedObserver) {
      this.addBudgetVersionIdObserver();
      this.attachedObserver = true;
    }

    const categories = this.getCategories();
    const categoryName = this.getInspectorName();
    const masterCategoryViewId = $('ul.is-checked').prevAll('ul.is-master-category').attr('id');

    if (masterCategoryViewId) {
      const masterCategory = ynabToolKit.shared.getEmberView(masterCategoryViewId).get('data');
      const masterCategoryId = masterCategory.get('categoryId');

      categories.forEach(category => {
        if (category.name === categoryName && category.masterCategoryId === masterCategoryId) {
          this.updateInspectorButton(category);

          return false;
        }
      });
    }
  }

  observe = (changedNodes) => {
    if (this.shouldInvoke() &&
      (
        changedNodes.has('inspector-quick-budget') ||
        changedNodes.has('budget-inspector-default')
      )) {
      this.invoke();
    }
  }

  addBudgetVersionIdObserver = () => {
    const resetBudgetView = () => {
      this.budgetView = null;
    };

    let applicationController = ynabToolKit.shared.containerLookup('controller:application');
    applicationController.addObserver('budgetVersionId', function () {
      Ember.run.scheduleOnce('afterRender', this, resetBudgetView);
    });
  }

  getCategories = () => {
    // After using Budget Quick Switch, budgetView needs to be reset to the new budget. The try catch construct is necessary
    // because this function can be called several times during the budget switch process.
    if (this.budgetView === null) {
      try {
        this.budgetView = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result;
      } catch (e) {
        return;
      }
    }

    const categories = [];
    const masterCats = this.budgetView.categoriesViewModel.masterCategoriesCollection._internalDataArray;
    const masterCategories = masterCats.filter(category => category.internalName === null);

    masterCategories.forEach((category) => {
      let accounts = this.budgetView
        .categoriesViewModel.subCategoriesCollection
        .findItemsByMasterCategoryId(category.entityId);

      Array.prototype.push.apply(categories, accounts);
    });

    return categories;
  }

  updateInspectorButton = (f) => {
    const amount = this.getBudgetAmount(f);
    const fAmount = ynabToolKit.shared.formatCurrency(amount);
    const existingButton = $('.toolkit-balance-to-zero');

    /* check for positive amounts */
    const positive = ynab.unformat(amount) > 0 ? '+' : '';
    const instance = this;

    if (existingButton.length) {
      existingButton
        .empty()
        .append(ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.balanceToZero'] || 'Balance to ' + ynabToolKit.shared.formatCurrency('0') + ': ')
        .append(' ' + positive)
        .append($('<strong>', { class: 'user-data', title: fAmount })
        .append(ynabToolKit.shared.appendFormattedCurrencyHtml($('<span>', { class: 'user-data currency zero' }), amount)))
        .data('name', f.name)
        .data('amount', amount);
    } else {
      const button = $('<a>', { class: 'budget-inspector-button toolkit-balance-to-zero' })
        .css({ 'text-align': 'center', 'line-height': '30px', display: 'block', cursor: 'pointer' })
        .data('name', f.name)
        .data('amount', amount)
        .click(function () {
          instance.updateBudgetedBalance($(this).data('name'), $(this).data('amount'));
        })
        .append(ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.balanceToZero'] || 'Balance to ' + ynabToolKit.shared.formatCurrency('0') + ': ')
        .append(' ' + positive)
        .append($('<strong>', { class: 'user-data', title: fAmount })
        .append(ynabToolKit.shared.appendFormattedCurrencyHtml($('<span>', { class: 'user-data currency zero' }), amount)));

      $('.inspector-quick-budget').append(button);
    }
  }

  updateBudgetedBalance = (name, difference) => {
    if (ynabToolKit.options.QuickBudgetWarning) {
      // no need to confirm quick budget if zero budgeted
      if (! $('div.budget-table ul.budget-table-row.is-checked li.budget-table-cell-budgeted .currency').hasClass('zero')) {
        if (!confirm('Are you sure you want to budget this amount?')) { // eslint-disable-line no-alert
          return;
        }
      }
    }

    const categories = $('.is-sub-category.is-checked');

    $(categories).each(function () {
      const accountName = $(this).find('.budget-table-cell-name div.button-truncate')
        .prop('title')
        .match(/.[^\n]*/)[0];

      if (accountName === name) {
        let input = $(this).find('.budget-table-cell-budgeted div.currency-input')
          .click()
          .find('input');

        let oldValue = input.val();

        oldValue = ynab.unformat(oldValue);
        difference = ynab.unformat(ynab.convertFromMilliDollars(difference)); // YNAB stores currency values * 1000
        let newValue = oldValue + difference;

        $(input).val(ynab.YNABSharedLib.currencyFormatter.format(ynab.convertToMilliDollars(newValue)));

        if (!ynabToolKit.options.QuickBudgetWarning) {
          // only seems to work if the confirmation doesn't pop up?
          // haven't figured out a way to properly blur otherwise
          input.blur();
        }
      }
    });
  }

  getInspectorName = () => {
    return $('.inspector-category-name.user-data').text().trim();
  }

  getBudgetAmount = (f) => {
    let currentMonth = moment(ynabToolKit.shared.parseSelectedMonth())
      .format('YYYY-MM');
    let monthlyBudget = this.budgetView
      .monthlySubCategoryBudgetCalculationsCollection
      .findItemByEntityId('mcbc/' + currentMonth + '/' + f.entityId);

    return (monthlyBudget.balance * -1);
  }
}
