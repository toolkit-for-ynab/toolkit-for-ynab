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

    showNewReleaseModal() {
      const { assets, environment, name, version } = ynabToolKit;
      // beta concatenates the TRAVIS_BUILD_NUMBER so we do this to strip it for
      // the URL that points to diffs on master for beta/development builds
      const githubVersion = version.split('.').slice(0, 3).join('.');
      const githubIssuesLink = '<a href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/issues" target="_blank">Github Issues</a>';

      const releaseNotes = ynabToolKit.environment === 'production'
        ? 'View the <a href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/releases" target="_blank">release notes</a>.'
        : `<br><br><div class="message">(Release notes are currently only available for production releases. However,
        ${githubIssuesLink} should be tagged with "beta" if they have made it into the beta build. It may also be helpful
        to see what changed by checking the raw commit log: <a href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/compare/v${githubVersion}...master" target="_blank">here</a>.)
        </div>`;

      const $modal = $(`<div class="toolkit-modal">
                      <div class="toolkit-modal-outer"><div class="toolkit-modal-inner"><div class="toolkit-modal-content">

                        <header class="toolkit-modal-header">
                          <img src="` + assets.logo + `" id="toolkit-modal-logo" />
                        </header>

                        <div class="toolkit-modal-message">
                          <h1>The ${name} extension has been updated!</h1>
                          <span class="version">
                            You are now using version ${version}. ${releaseNotes}
                          </span>
                          <div class="message">
                            <p>
                              <strong>It is important to note that the ${name} extension is completely separate,
                              and in no way affiliated with YNAB itself.</strong> If you discover a bug, please first disable
                              the Toolkit to identify whether the issue is with the extension, or with YNAB itself.
                            </p>
                            <p>
                              Issues with ${name} can be reported to the Toolkit team by submitting an issue on our
                              ${githubIssuesLink} page. Please ensure the issue has not already been reported before
                              submitting${environment !== 'production' ? ' and mark issue titles with [BETA].' : '.'}
                            </p>
                            <p>
                              Finally, if you have the time and the ability, new contributors to the Toolkit are always welcome!
                            </p>
                          </div>
                        </div>

                        <footer class="toolkit-modal-actions">
                          <button class="toolkit-modal-action-close">Continue</button>
                        </footer>

                      </div></div></div>
                    </div>`);

      $('.toolkit-modal-action-close', $modal).on('click', () => {
        $('.layout .toolkit-modal').remove();
      });

      if (!$('.modal-error').length) {
        $('.layout').append($modal);
      }
    },

    getToolkitStorageKey(key) {
      const value = localStorage.getItem(storageKeyPrefix + key);

      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },

    setToolkitStorageKey(key, value) {
      return localStorage.setItem(storageKeyPrefix + key, value);
    },

    removeToolkitStorageKey(key, value) {
      return localStorage.removeItem(storageKeyPrefix + key, value);
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

      return String(htmlString).replace(/[&<>"'`=/]/g, function fromEntityMap(s) {
        return entityMap[s];
      });
    },

    getCurrentRoute: function () {
      let applicationController = this.containerLookup('controller:application');
      return applicationController.get('currentRouteName');
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

    const latestVersionKey = `latest-version-${ynabToolKit.environment}`;
    let latestVersion = ynabToolKit.shared.getToolkitStorageKey(latestVersionKey);
    if (latestVersion) {
      if (latestVersion !== ynabToolKit.version) {
        ynabToolKit.shared.showNewReleaseModal();
        ynabToolKit.shared.setToolkitStorageKey(latestVersionKey, ynabToolKit.version);
      }
    } else {
      ynabToolKit.shared.setToolkitStorageKey(latestVersionKey, ynabToolKit.version);
    }

    const deprecatedLatestVersion = ynabToolKit.shared.getToolkitStorageKey('latest-version');
    if (deprecatedLatestVersion && deprecatedLatestVersion !== ynabToolKit.version) {
      ynabToolKit.shared.removeToolkitStorageKey('latest-version');
      ynabToolKit.shared.showNewReleaseModal();
    }
  } else if (typeof Ember !== 'undefined') {
    Ember.run.next(poll, 250);
  } else {
    setTimeout(poll, 250);
  }
}());
