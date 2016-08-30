/* eslint-disable no-nested-ternary, one-var-declaration-per-line, one-var */

ynabToolKit.shared = (function () {
  let storageKeyPrefix = 'ynab-toolkit-';
  let subCategories = []; // defined here for scope reasons but populated and returned in getCategories()
  return {
    //
    // Get all master and sub categories and combine them into one array. This is needed because it's
    // possible to  have the same sub-category name in multiple master categories. YNAB only provides a
    // method for obtaining a sub category by name but the name needs to be qualified by the master
    // category name. This routine creates a new attribute "toolkitName" on each element that is the
    // combination of the master and sub category names.
    //
    // TODO: Figure out how to "watch" categories for changes (additions/deletions/updates) in which case
    //       the array needs to be rebuilt. Currently this must be done in "feature" code but should be
    //       done here.
    //
    getMergedCategories() {
      var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
      var mCats = entityManager.getAllNonTombstonedMasterCategories();

      subCategories.length = 0;

      for (var i = 0; i < mCats.length; i++) {
        var mCat = mCats[i];

        // Ignore certain categories!
        if (mCat.isHidden !== true && mCat.name !== 'Internal Master Category') {
          var tCats = entityManager.getSubCategoriesByMasterCategoryId(mCat.getEntityId());
          for (var j = 0; j < tCats.length; j++) {
            var subCategory = tCats[j];

            // Ignore certain categories!
            if (subCategory.isHidden !== true && !subCategory.isTombstone && subCategory.name !== 'Uncategorized Transactions') {
              subCategory.toolkitName = mCat.name + '_' + subCategory.name; // Add toolkit specific attribute
              subCategories.push(subCategory);
            }
          }
        }
      }

      return subCategories;
    },

    // This function returns all visible transactions matching accountId.
    // If accountId === 'null' then all transactions for all accounts are returned with the visibility
    // settings for All accounts applied.
    getVisibleTransactions(accountId) {
      var transactions, endDate, endDateUTC, sortBySortableIndex, accountStartMonth, accountStartYear, subTransactionsAdded, scheduledTransactions, addSubTransactionToVisibleTransactions, transactionPosition, accountShowReconciled, accountSettings, subTransaction, singleOccurranceTransactions, accountShowScheduled, startDateUTC, sortedSubTransactions, subTransactions, accountEndMonth, accountEndYear, visibleTransactions, accountShowWithNotifications, b, f;
      if (accountId === 'null') {
        transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.visibleTransactionDisplayItems || [];
      } else {
        transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.transactionDisplayItemsCollection.findItemsByAccountId(accountId) || [];
      }

      accountSettings = jQuery.parseJSON(localStorage.getItem('.' + accountId + '_account_filter'));
      accountStartMonth = accountSettings.fromMonth;
      accountStartYear = accountSettings.fromYear;
      accountEndMonth = accountSettings.toMonth;
      accountEndYear = accountSettings.toYear;
      accountShowReconciled = accountSettings.reconciled;
      accountShowScheduled = accountSettings.scheduled;
      accountShowWithNotifications = accountSettings.withNotification;
      if (accountStartMonth !== null && accountStartYear !== null) {
        startDateUTC = new ynab.utilities.DateWithoutTime(accountStartYear, accountStartMonth).getUTCTime();
      }

      if (accountEndMonth !== null && accountEndYear !== null) {
        endDate = new ynab.utilities.DateWithoutTime(accountEndYear, accountEndMonth);
        endDate.addMonths(1);
        endDateUTC = endDate.getUTCTime();
      }

      scheduledTransactions = Object.create(null);
      subTransactions = Object.create(null);
      singleOccurranceTransactions = [];
      visibleTransactions = transactions.filter(function (transaction) {
        var shouldFilter, transactionCleared, transactionDate, transactionDateUTC, transactionDisplayItemType, transactionEntityId, transactionIsSplit, transactionIsTombstone, transactionNeedsApproval, transactionNeedsCategory, parentEntityId, transactionProperties;
        transactionProperties = transaction.getProperties('entityId', 'isTombstone', 'displayItemType', 'date', 'cleared', 'needsApproval', 'needsCategory', 'isSplit');
        transactionEntityId = transactionProperties.entityId;
        transactionIsTombstone = transactionProperties.isTombstone;
        transactionDisplayItemType = transactionProperties.displayItemType;
        transactionDate = transactionProperties.date;
        transactionCleared = transactionProperties.cleared;
        transactionNeedsApproval = transactionProperties.needsApproval;
        transactionNeedsCategory = transactionProperties.needsCategory;
        transactionIsSplit = transactionProperties.isSplit;
        transactionDateUTC = transactionDate.getUTCTime();
        shouldFilter = transactionIsTombstone ? false :
          (startDateUTC && startDateUTC > transactionDateUTC || endDateUTC && transactionDateUTC >= endDateUTC ? false :
          accountShowReconciled === false && transactionCleared === ynab.constants.TransactionState.Reconciled ? false :
          accountShowWithNotifications === 'needsApproval' && !transactionNeedsApproval ||
          accountShowWithNotifications === 'needsCategory' && (!transactionNeedsCategory || transactionNeedsApproval) ? false :
          transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.ScheduledTransaction ? (accountShowScheduled && (singleOccurranceTransactions.push(transaction),
          scheduledTransactions[transactionEntityId] = transaction), false) :
          transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.SubTransaction || transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction ? (parentEntityId = transaction.get('parentEntityId'),
          Array.isArray(subTransactions[parentEntityId]) || (subTransactions[parentEntityId] = []), subTransactions[parentEntityId].push(transaction), false) :
          (transactionIsSplit && (scheduledTransactions[transactionEntityId] = transaction), true));

        return shouldFilter;
      });

      visibleTransactions.push.apply(visibleTransactions, singleOccurranceTransactions);

      // eslint-disable-next-line no-shadow
      addSubTransactionToVisibleTransactions = function (transactionPosition, subTransaction) {
        var n = visibleTransactions.length;
        return transactionPosition >= n ? visibleTransactions.push(subTransaction) : visibleTransactions.splice(transactionPosition, 0, subTransaction);
      };

      sortBySortableIndex = function (e) {
        return e.sortBy('sortableIndex');
      };

      for (var scheduledTransaction in scheduledTransactions) {
        transactionPosition = visibleTransactions.indexOf(scheduledTransactions[scheduledTransaction]);
        if (transactionPosition !== false) {
          if (subTransactions[scheduledTransaction]) {
            subTransactionsAdded = 0;
            sortedSubTransactions = sortBySortableIndex(subTransactions[scheduledTransaction]);
            f = 0;
            for (b = sortedSubTransactions.length; b > f; f++) {
              subTransaction = sortedSubTransactions[f];

              // eslint-disable-next-line no-unused-expressions
              subTransaction.get('isTombstone') || (subTransactionsAdded++,
              addSubTransactionToVisibleTransactions(subTransactionsAdded + transactionPosition, subTransaction));
            }
          }
        }
      }

      return visibleTransactions;
    },

    // This function formats a number to a currency.
    // number is the number you want to format, and html dictates if the <bdi> tag should be added or not.
    formatCurrency(number) {
      var formatted, currency, negative, currencySymbol;
      formatted = ynab.formatCurrency(number);
      currency = ynab.YNABSharedLib.currencyFormatter.getCurrency();
      if (!currency.display_symbol) {
        return new Ember.Handlebars.SafeString(formatted);
      }

      currencySymbol = Ember.Handlebars.Utils.escapeExpression(currency.currency_symbol);

      // eslint-disable-next-line yoda, no-unused-expressions
      currency.symbol_first ? (negative = '-' === formatted.charAt(0), formatted = negative ? '-' + currencySymbol + formatted.slice(1) : currencySymbol + formatted) : formatted += currencySymbol;

      return new Ember.Handlebars.SafeString(formatted);
    },

    appendFormattedCurrencyHtml(jQueryElement, number) {
      var formatted = ynab.formatCurrency(number);
      var currency = ynab.YNABSharedLib.currencyFormatter.getCurrency();

      if (!currency.display_symbol) {
        jQueryElement.text(formatted);
        return;
      }

      if (currency.symbol_first) {
        if (formatted.charAt(0) === '-') {
          jQueryElement.append('-');
          formatted = formatted.slice(1);
        }

        jQueryElement.append($('<bdi>', { text: currency.currency_symbol }))
                     .append(formatted);
      } else {
        jQueryElement.append(formatted)
                     .append($('<bdi>', { text: currency.currency_symbol }));
      }

      return jQueryElement;
    },

    toLocalDate(date) {
      var result = date.toNativeDate();
      var offset = new Date().getTimezoneOffset();

      result.setMinutes(result.getMinutes() + offset);

      // Sometimes we don't end up exactly where we need to be because of floating point
      // accuracy issues. If we're in PM, we should round up to the next day.
      if (result.getHours() > 0) {
        // Bumps us to the first hour of the next day.
        result.setHours(24, 0, 0, 0);
      }

      return result;
    },

    parseSelectedMonth() {
      // TODO: There's probably a better way to reference this view, but this works better than DOM scraping which seems to fail in Firefox
      if ($('.ember-view .budget-header').length) {
        var headerView = this.getEmberView($('.ember-view .budget-header').attr('id'));
        var selectedMonthUTC = headerView.get('currentMonth').toNativeDate();
        return new Date(selectedMonthUTC.getUTCFullYear(), selectedMonthUTC.getUTCMonth(), 1);
      }

      return null;
    },

    // TODO Maybe add universal function.
    // Usage: declension(daysNumber, {nom: 'день', gen: 'дня', plu: 'дней'});
    declension(locale, num, cases) {
      if (locale === 'ru') {
        num = Math.abs(num);
        var word = '';
        if (num.toString().indexOf('.') > -1) {
          word = cases.gen;
        } else {
          word = (
            num % 10 === 1 && num % 100 !== 11
              ? cases.nom
              : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)
                ? cases.gen
                : cases.plu
          );
        }

        return word;
      }
    },

    // Pass over each available category balance and provide a total. This can be used to
    // evaluate if a feature script needs to continue based on an update to the budget.
    availableBalance: (function () {
      return {
        presentTotal: 0,
        cachedTotal: 'init',
        snapshot() {
          var totalAvailable = 0;

          // Find and collect the available balances of each category in the budget
          var availableBalances = $('.budget-table-cell-available').find('span.user-data.currency').map(function () {
            var availableBalance = $(this).html();
            return Number(availableBalance.replace(/[^\d.-]/g, ''));
          });

          // Add each balance together to get the total available sum
          $.each(availableBalances, function () { totalAvailable += parseFloat(this) || 0; });

          return totalAvailable;
        }
      };
    }()),

    /**
     * Short function for obtaining an Ember view.
     *
     * Variable number of parms is supported. First is the container name, second is the
     * view index number. Defaults to 0.
     */
    containerLookup(name, index) {
      var containerName = name;
      var viewIndex = (typeof index !== 'undefined') ? index : 0;

      return this.getEmberView(Ember.keys(this.getEmberViewRegistry())[viewIndex]).container.lookup(containerName);
    },

    // Add formatting method to dates to get YYYY-MM.
    yyyymm(date) {
      var yyyy = date.getFullYear().toString();
      var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
      return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]); // padding
    },

    getEmberView(viewId) {
      var registry = this.getEmberViewRegistry();
      return registry[viewId];
    },

    getEmberViewByContainerKey(containerKey) {
      var registry = this.getEmberViewRegistry();
      for (var viewId in registry) {
        if (registry[viewId].get('_debugContainerKey') === containerKey) {
          return registry[viewId];
        }
      }
    },

    getEmberViewRegistry() {
      return Ember.Component.create().get('_viewRegistry');
    },

    invokeExternalFeature(featureName) {
      var self = this;
      if (ynabToolKit[featureName] && typeof ynabToolKit[featureName].invoke === 'function') {
        ynabToolKit[featureName].invoke();
      } else {
        setTimeout(function () {
          self.invokeExternalFeature(featureName);
        }, 250);
      }
    },

    showModal(title, message, actionType) {
      let actions;
      switch (actionType) {
        case 'reload':
          actions = '<button class="button button-primary toolkit-modal-action-reload">Reload</button>';
          break;
        case 'close':
          actions = '<button class="button button-primary toolkit-modal-action-close">Close</button>';
          break;
      }

      let $modal = $(`<div class="ynab-u modal-overlay modal-generic modal-error active toolkit-modal">
                        <div class="modal" style="height: auto">
                          <div class="modal-header">
                            ${title}
                          </div>
                          <div class="modal-content">
                            ${message}
                          </div>
                          <div class="modal-actions">
                            ${actions}
                          </div>
                        </div>
                      </div>`);

      $modal.find('.toolkit-modal-action-reload').on('click', () => {
        return windowReload();
      });

      $modal.find('.toolkit-modal-action-close').on('click', () => {
        return $('.layout .toolkit-modal').remove();
      });

      if (!$('.modal-error').length) {
        $('.layout').append($modal);
      }
    },

    showFeatureErrorModal(featureName) {
      let title = 'Toolkit for YNAB Error!';
      let message = `The toolkit is having an issue with the "${featureName}" feature. Please submit an issue <a href='https://github.com/toolkit-for-ynab/toolkit-for-ynab/issues/new' target='_blank'>here</a> if there isn't one already.`;
      this.showModal(title, message, 'close');
    },

    getToolkitStorageKey(key) {
      return localStorage.getItem(storageKeyPrefix + key);
    },

    setToolkitStorageKey(key, value) {
      return localStorage.setItem(storageKeyPrefix + key, value);
    },

    // https://github.com/janl/mustache.js/blob/master/mustache.js#L60
    escapeHtml(htmlString) {
      let entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      };

      return String(htmlString).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
        return entityMap[s];
      });
    },

    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
       ],
    monthsFull: ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'
       ]
  };
}()); // Keep feature functions contained within this object

// This poll() function will only need to run until we find that the DOM is ready
// For certain functions, we may run them once automatically on page load before 'changes' occur
(function poll() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined' &&
      typeof $ !== 'undefined' && $('.ember-view.layout').length &&
      typeof ynabToolKit !== 'undefined') {
    ynabToolKit.pageReady = true;

    let latestVersion = ynabToolKit.shared.getToolkitStorageKey('latest-version');
    if (latestVersion) {
      if (latestVersion !== ynabToolKit.version) {
        let title = 'New Toolkit for YNAB Features!';
        let message = 'The Toolkit for YNAB has been updated! Take a gander <a href="http://forum.youneedabudget.com/categories/ynab-extensions" target="_blank">over here</a> to see what new goodies are in store!';
        ynabToolKit.shared.showModal(title, message, 'close');
        ynabToolKit.shared.setToolkitStorageKey('latest-version', ynabToolKit.version);
      }
    } else {
      ynabToolKit.shared.setToolkitStorageKey('latest-version', ynabToolKit.version);
    }
  } else {
    setTimeout(poll, 250);
  }
}());
