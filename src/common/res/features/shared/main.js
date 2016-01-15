window.ynabToolKit = new function() {

    // This variable is populated by each active script loaded inside the ynabToolKit object
    this.featureOptions = {},

    //When this is true, the feature scripts will know they are ready to execute
    this.pageReady = {},

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
    };

}; // end ynabToolKit object


// This poll() function will only need to run until we find that the DOM is ready
// For certain functions, we may run them once automatically on page load before 'changes' occur
(function poll() {
    if (typeof Em !== 'undefined' && typeof Ember !== 'undefined'
          && typeof $ !== 'undefined' && $('.ember-view.layout').length) {

      ynabToolKit.pageReady = true;

    } else {
       setTimeout(poll, 250);
    }
 })();
