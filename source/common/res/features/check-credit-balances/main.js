(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.checkCreditBalances = (function () {
      return {
        budgetView: ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result,

        invoke() {
          if (ynabToolKit.checkCreditBalances.inMonth()) {
            var debtAccounts = ynabToolKit.checkCreditBalances.getDebtAccounts();
            ynabToolKit.checkCreditBalances.processDebtAccounts(debtAccounts);
          }
        },

        observe(changedNodes) {
          if (changedNodes.has('navlink-budget active') ||
              changedNodes.has('budget-table-cell-available-div user-data') ||
              changedNodes.has('budget-inspector')) {
            ynabToolKit.checkCreditBalances.invoke();
          }
        },

        addBudgetVersionIdObserver() {
          let applicationController = ynabToolKit.shared.containerLookup('controller:application');
          applicationController.addObserver('budgetVersionId', function () {
            Ember.run.scheduleOnce('afterRender', this, resetBudgetViewCheckCreditBalances);
          });

          function resetBudgetViewCheckCreditBalances() {
            ynabToolKit.checkCreditBalances.budgetView = null;
          }
        },

        inMonth() {
          var today = new Date();
          var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
          if (selectedMonth === null) return false;

          // check for current month or future month
          return selectedMonth.getMonth() >= today.getMonth() && selectedMonth.getYear() >= today.getYear();
        },

        getDebtAccounts() {
          // After using Budget Quick Switch, budgetView needs to be reset to the new budget. The try catch construct is necessary
          // because this function can be called several times during the budget switch process.
          if (ynabToolKit.checkCreditBalances.budgetView === null) {
            try {
              ynabToolKit.checkCreditBalances.budgetView = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result;
            } catch (e) {
              return;
            }
          }

          var categoryEntityId = ynabToolKit.checkCreditBalances.budgetView
            .categoriesViewModel.debtPaymentMasterCategory.entityId;

          var debtAccounts = ynabToolKit.checkCreditBalances.budgetView
            .categoriesViewModel.subCategoriesCollection
            .findItemsByMasterCategoryId(categoryEntityId);

          return debtAccounts || [];
        },

        processDebtAccounts(debtAccounts) {
          debtAccounts.forEach(function (a) {
            // Not sure why but sometimes on a reload (F5 or CTRL-R) of YNAB, the accountId field is null which if not handled
            // throws an error and kills the feature.
            if (a.accountId !== null) {
              var account = ynabToolKit.checkCreditBalances.budgetView
                .sidebarViewModel.accountCalculationsCollection
                .findItemByAccountId(a.accountId);

              var balance = account.clearedBalance + account.unclearedBalance;

              var currentMonth = moment(ynabToolKit.shared.parseSelectedMonth()).format('YYYY-MM');
              var monthlyBudget = ynabToolKit.checkCreditBalances.budgetView
                .monthlySubCategoryBudgetCalculationsCollection
                .findItemByEntityId('mcbc/' + currentMonth + '/' + a.entityId);

              var available = 0;
              if (monthlyBudget) {
                available = monthlyBudget.balance;
              }

              // ensure that available is >= zero, otherwise don't update
              if (available >= 0) {
                // If cleared balance is positive, bring available to 0, otherwise
                // offset by the correct amount
                var difference = 0;
                if (balance > 0) {
                  difference = (available * -1);
                } else {
                  difference = ((available + balance) * -1);
                }

                ynabToolKit.checkCreditBalances.updateInspectorButton(a.name, difference);

                if (available !== (balance * -1)) {
                  ynabToolKit.checkCreditBalances.updateRow(a.name);
                  ynabToolKit.checkCreditBalances.updateInspectorStyle(a.name);
                }
              }
            }
          });
        },

        updateRow(name) {
          var rows = $('.is-sub-category.is-debt-payment-category');
          rows.each(function () {
            var accountName = $(this).find('.budget-table-cell-name div.button-truncate')
                                     .prop('title')
                                     .match(/.[^\n]*/)[0]; // strip the Note string

            if (name === accountName) {
              var categoryBalance = $(this).find('.budget-table-cell-available-div .user-data.currency');
              categoryBalance.removeClass('positive zero');
              if (!categoryBalance.hasClass('negative')) {
                $(this).find('.budget-table-cell-available-div .user-data.currency').addClass('cautious toolkit-pif-cautious');
              }
            }
          });
        },

        updateInspectorStyle(name) {
          var inspectorName = $('.inspector-category-name.user-data').text().trim();
          if (name === inspectorName) {
            var inspectorBalance = $('.inspector-overview-available .user-data .user-data.currency');
            inspectorBalance.removeClass('positive zero');
            if (!inspectorBalance.hasClass('negative')) {
              $('.inspector-overview-available .user-data .user-data.currency, .inspector-overview-available dt').addClass('cautious toolkit-pif-cautious');
            }
          }
        },

        updateInspectorButton(name, difference) {
          var inspectorName = $('.inspector-category-name.user-data').text().trim();

          if (name && name === inspectorName) {
            if ($('.toolkit-toolkit-rectify-difference').length || difference === '-0') {
              return;
            }

            var fDifference = ynabToolKit.shared.formatCurrency(difference);
            var positive = '';
            if (ynab.unformat(difference) >= 0) {
              positive = '+';
            }

            var button = $('<a>', {
              class: 'budget-inspector-button toolkit-rectify-difference'
            })
              .css({
                'text-align': 'center',
                'line-height': '30px',
                display: 'block',
                cursor: 'pointer'
              })
              .data('name', name)
              .data('difference', difference)
              .click(function () {
                ynabToolKit.checkCreditBalances.updateCreditBalances($(this).data('name'), $(this).data('difference'));
              })
              .append(((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.checkCreditBalances']) || 'Rectify Available for PIF CC:'))
              .append(' ' + positive)
              .append($('<strong>', { class: 'user-data', title: fDifference })
                .append(ynabToolKit.shared.appendFormattedCurrencyHtml($('<span>', { class: 'user-data currency zero' }), difference)));

            $('.inspector-quick-budget').append(button);
          }
        },

        updateCreditBalances(name, difference) {
          // eslint-disable-next-line no-alert
          if ((ynabToolKit.options.warnOnQuickBudget !== 0) && (!confirm('Are you sure you want to do this?'))) {
            return;
          }

          var debtPaymentCategories = $('.is-debt-payment-category.is-sub-category');

          $(debtPaymentCategories).each(function () {
            var accountName = $(this).find('.budget-table-cell-name div.button-truncate')
                                     .prop('title')
                                     .match(/.[^\n]*/)[0];
            if (accountName === name) {
              var input = $(this).find('.budget-table-cell-budgeted div.currency-input').click()
                                 .find('input');

              var oldValue = input.val();

              // If nothing is budgeted, the input will be empty
              oldValue = oldValue || 0;

              // YNAB stores values *1000 for decimal places, so just
              // multiple by 1000 to get the actual amount.
              var newValue = (ynab.unformat(oldValue) * 1000 + difference);

              // format the calculated value back to selected number format
              input.val(ynab.formatCurrency(newValue));

              if (ynabToolKit.options.warnOnQuickBudget === 0) {
                // only seems to work if the confirmation doesn't pop up?
                // haven't figured out a way to properly blur otherwise
                input.blur();
              }
            }
          });
        }
      };
    }()); // Keep feature functions contained within this object

    if (ynabToolKit.shared.getCurrentRoute() === 'budget.index') {
      ynabToolKit.checkCreditBalances.invoke();
    }
    // Run once to activate our observer()
    ynabToolKit.checkCreditBalances.addBudgetVersionIdObserver();
  } else {
    setTimeout(poll, 250);
  }
}());
