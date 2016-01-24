ynabToolKit.shared = new function() {

    // This function returns all visible transactions matching accountId.
    // If accountId === 'null' then all transactions for all accounts are returned with the visibility
    // settings for All accounts applied.
    this.getVisibleTransactions = function (accountId)  {
        var transactions, endDate, endDateUTC, sortBySortableIndex, accountStartMonth, accountStartYear, subTransactionsAdded, scheduledTransactions, addSubTransactionToVisibleTransactions, transactionPosition, accountShowReconciled, accountSettings, subTransaction, singleOccurranceTransactions, accountShowScheduled, startDateUTC, sortedSubTransactions, subTransactions, accountEndMonth, accountEndYear, visibleTransactions, accountShowWithNotifications, b, f;
        if (accountId === 'null') {
            transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.visibleTransactionDisplayItems;
        } else {
            transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.transactionDisplayItemsCollection.findItemsByAccountId(accountId);
        }
        accountSettings = jQuery.parseJSON(localStorage.getItem("." + accountId + "_account_filter"));
        accountStartMonth = accountSettings.fromMonth;
        accountStartYear = accountSettings.fromYear;
        accountEndMonth = accountSettings.toMonth;
        accountEndYear = accountSettings.toYear;
        accountShowReconciled = accountSettings.reconciled;
        accountShowScheduled = accountSettings.scheduled;
        accountShowWithNotifications = accountSettings.withNotification;
        if (null !== accountStartMonth && null !== accountStartYear) {
            startDateUTC = new ynab.utilities.DateWithoutTime(accountStartYear, accountStartMonth).getUTCTime();
        }
        if (null !== accountEndMonth && null !== accountEndYear) {
            endDate = new ynab.utilities.DateWithoutTime(accountEndYear, accountEndMonth);
            endDate.addMonths(1);
            endDateUTC = endDate.getUTCTime();
        }
        scheduledTransactions = Object.create(null);
        subTransactions = Object.create(null);
        singleOccurranceTransactions = [];
        visibleTransactions = transactions.filter(function(transaction) {
            var transactionCleared, transactionDate, transactionDateUTC, transactionDisplayItemType, transactionEntityId, transactionIsSplit, transactionIsTombstone, transactionNeedsApproval, transactionNeedsCategory, parentEntityId, transactionProperties;
            transactionProperties = transaction.getProperties("entityId", "isTombstone", "displayItemType", "date", "cleared", "needsApproval", "needsCategory", "isSplit");
            transactionEntityId = transactionProperties.entityId;
            transactionIsTombstone = transactionProperties.isTombstone;
            transactionDisplayItemType = transactionProperties.displayItemType;
            transactionDate = transactionProperties.date;
            transactionCleared = transactionProperties.cleared;
            transactionNeedsApproval = transactionProperties.needsApproval;
            transactionNeedsCategory = transactionProperties.needsCategory;
            transactionIsSplit = transactionProperties.isSplit;
            transactionDateUTC = transactionDate.getUTCTime();
            return transactionIsTombstone ? false :
            (startDateUTC && startDateUTC > transactionDateUTC || endDateUTC && transactionDateUTC >= endDateUTC ? false :
            accountShowReconciled === false && transactionCleared === ynab.constants.TransactionState.Reconciled ? false :
            "needsApproval" === accountShowWithNotifications && !transactionNeedsApproval || "needsCategory" === accountShowWithNotifications && (!transactionNeedsCategory || transactionNeedsApproval) ? false :
            transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.ScheduledTransaction ? (accountShowScheduled && (singleOccurranceTransactions.push(transaction),
            scheduledTransactions[transactionEntityId] = transaction), false) :
            transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.SubTransaction || transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction ? (parentEntityId = transaction.get("parentEntityId"),
            Array.isArray(subTransactions[parentEntityId]) || (subTransactions[parentEntityId] = []), subTransactions[parentEntityId].push(transaction), false) :
            (transactionIsSplit && (scheduledTransactions[transactionEntityId] = transaction), true));
        });
        visibleTransactions.push.apply(visibleTransactions, singleOccurranceTransactions);
        addSubTransactionToVisibleTransactions = function(transactionPosition, subTransaction) {
            var n = visibleTransactions.length;
            return transactionPosition >= n ? visibleTransactions.push(subTransaction) : visibleTransactions.splice(transactionPosition, 0, subTransaction);
        };
        sortBySortableIndex = function(e) {
            return e.sortBy("sortableIndex");
        };
        for (scheduledTransaction in scheduledTransactions) {
            transactionPosition = visibleTransactions.indexOf(scheduledTransactions[scheduledTransaction]);
            if (transactionPosition !== false) {
                if (subTransactions[scheduledTransaction]) {
                    subTransactionsAdded = 0;
                    sortedSubTransactions = sortBySortableIndex(subTransactions[scheduledTransaction]);
                    f = 0;
                    for (b = sortedSubTransactions.length; b > f; f++) {
                        subTransaction = sortedSubTransactions[f];
                        subTransaction.get("isTombstone") || (subTransactionsAdded++,
                        addSubTransactionToVisibleTransactions(subTransactionsAdded + transactionPosition, subTransaction));
                    }
                }
            }
        }
        return visibleTransactions;
    },

    // This function formats a number to a currency.
    // number is the number you want to format, and html dictates if the <bdi> tag should be added or not.
    this.formatCurrency = function (number, html) {
        var formatted, currency, negative, currencySymbol;
        formatted = ynab.formatCurrency(number);
        currency = ynab.YNABSharedLib.currencyFormatter.getCurrency();
        if (!currency.display_symbol) {
            return new Ember.Handlebars.SafeString(formatted);
        }
        currencySymbol = Ember.Handlebars.Utils.escapeExpression(currency.currency_symbol);
        if (html) {
            currencySymbol = "<bdi>" + currencySymbol + "</bdi>";
        }
        currency.symbol_first ? (negative = "-" === formatted.charAt(0), formatted = negative ? "-" + currencySymbol + formatted.slice(1) : currencySymbol + formatted) : formatted += currencySymbol;
        return new Ember.Handlebars.SafeString(formatted);
    },

    this.parseSelectedMonth = function () {
        // TODO: There's probably a better way to reference this view, but this works better than DOM scraping which seems to fail in Firefox
        if($('.ember-view .budget-header').length) {
            var headerView = Ember.View.views[$('.ember-view .budget-header').attr("id")];
            var selectedMonthUTC = headerView.get("currentMonth").toNativeDate();
            return new Date(selectedMonthUTC.getUTCFullYear(), selectedMonthUTC.getUTCMonth(), 1);
        } else {
            return null;
        }
    },

    // TODO Maybe add universal function.
    // Usage: declension(daysNumber, {nom: 'день', gen: 'дня', plu: 'дней'});
    this.declension = function (locale, num, cases) {
      if (locale == 'ru') {
        num = Math.abs(num);
        var word = '';
        if (num.toString().indexOf('.') > -1) {
          word = cases.gen;
        } else {
          word = (
            num % 10 == 1 && num % 100 != 11
              ? cases.nom
              : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)
                ? cases.gen
                : cases.plu
          );
        }
        return word;
      }
      else {
        console.log('Unknown locale')
      }
    }

    // Pass over each available category balance and provide a total. This can be used to
    // evaluate if a feature script needs to continue based on an update to the budget.
    this.availableBalance = new function() {

        this.presentTotal = 0,

        this.cachedTotal = 'init',

        this.snapshot = function() {
            var totalAvailable = 0;

            // Find and collect the available balances of each category in the budget
            var availableBalances = $('.budget-table-cell-available').find('span.user-data.currency').map(function() {
                availableBalance = $(this).html();
                return Number(availableBalance.replace(/[^\d.-]/g, ''));
            });

            // Add each balance together to get the total available sum
            $.each(availableBalances,function(){totalAvailable+=parseFloat(this) || 0;});
            return totalAvailable;
        }

    }

}; // end ynabToolKit object


// This poll() function will only need to run until we find that the DOM is ready
// For certain functions, we may run them once automatically on page load before 'changes' occur
(function poll() {
    if (typeof Em !== 'undefined' && typeof Ember !== 'undefined'
          && typeof $ !== 'undefined' && $('.ember-view.layout').length
          && typeof ynabToolKit !== 'undefined') {

      ynabToolKit.pageReady = true;

    } else {
       setTimeout(poll, 250);
    }
 })();


// Add formatting method to Date to get YYYY-MM.
Date.prototype.yyyymm = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]); // padding
};
