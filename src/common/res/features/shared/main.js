window.ynabToolKit = new function() {

    // This variable is populated by each active script loaded inside the ynabToolKit object
    this.featureOptions = {},

    //When this is true, the feature scripts will know they are ready to execute
    this.pageReady = {},

    // This function returns all visible transactions matching accountId.
    // If accountId === 'null' then all transactions for all accounts are returned with the visibility
    // settings for All accounts applied.
    this.getVisibleTransactions = function (accountId)  {
        var transactions, originalTransactions, n, r, a, endDate, o, s, startMonth, startYear, d, u, scheduledTransactions, p, m, g, f, y, v, b, C, _, showReconciled, T, accountSettings, A, E, x, singleOccurringTransactions, F, I, S, startDateUTC, D, subTransactions, endMonth, endYear, R, O, Y, visibleTransactions, showNotifications;
        if (accountId === 'null') {
            transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.visibleTransactionDisplayItems;
        } else {
            transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.transactionDisplayItemsCollection.findItemsByAccountId(accountId);
        }
        originalTransactions = transactions;
        accountSettings = jQuery.parseJSON(localStorage.getItem("." + accountId + "_account_filter")),
        startMonth = accountSettings.fromMonth,
        startYear = accountSettings.fromYear,
        endMonth = accountSettings.toMonth,
        endYear = accountSettings.toYear,
        showReconciled = accountSettings.reconciled,
        showScheduled = accountSettings.scheduled,
        showNotifications = accountSettings.withNotification,
        null !== startMonth && null !== startYear && (startDateUTC = new ynab.utilities.DateWithoutTime(startYear, startMonth).getUTCTime()),
        null !== endMonth && null !== endYear && (endDate = new ynab.utilities.DateWithoutTime(endYear, endMonth),
        endDate.addMonths(1),
        endDateUTC = endDate.getUTCTime()),
        scheduledTransactions = Object.create(null),
        subTransactions = Object.create(null),
        singleOccurringTransactions = [];
        visibleTransactions = transactions.filter(function(transaction) {
            var transactionCleared, transactionDate, transactionDateUTC, transactionDisplayItemType, transactionEntityId, transactionIsSplit, transactionIsTombstone, transactionNeedsApproval, transactionNeedsCategory, parentEntityId, transactionProperties;
            return transactionProperties = transaction.getProperties("entityId", "isTombstone", "displayItemType", "date", "cleared", "needsApproval", "needsCategory", "isSplit"),
            transactionEntityId = transactionProperties.entityId, //s
            transactionIsTombstone = transactionProperties.isTombstone, //l
            transactionDisplayItemType = transactionProperties.displayItemType, //o
            transactionDate = transactionProperties.date, //r
            transactionCleared = transactionProperties.cleared, //t
            transactionNeedsApproval = transactionProperties.needsApproval, //d
            transactionNeedsCategory = transactionProperties.needsCategory, //u
            transactionIsSplit = transactionProperties.isSplit, //c
            transactionIsTombstone ? (!1) : (transactionDateUTC = transactionDate.getUTCTime(),
            startDateUTC && startDateUTC > transactionDateUTC || endDateUTC && transactionDateUTC >= endDateUTC ? !1 : showReconciled === !1 && transactionCleared === ynab.constants.TransactionState.Reconciled ? !1 : "needsApproval" === showNotifications && !transactionNeedsApproval || "needsCategory" === showNotifications && (!transactionNeedsCategory || transactionNeedsApproval) ? !1 : transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.ScheduledTransaction ? (showScheduled && (singleOccurringTransactions.push(transaction),
            scheduledTransactions[transactionEntityId] = transaction),
            !1) : transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.SubTransaction || transactionDisplayItemType === ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction ? (parentEntityId = transaction.get("parentEntityId"),
            Array.isArray(subTransactions[parentEntityId]) || (subTransactions[parentEntityId] = []),
            subTransactions[parentEntityId].push(transaction),
            !1) : (transactionIsSplit && (scheduledTransactions[transactionEntityId] = transaction),
            !0))
        }),
        visibleTransactions.push.apply(visibleTransactions, singleOccurringTransactions),
        p = function(transactions, originalTransactions) {
            var n;
            return n = visibleTransactions.length,
            transactions >= n ? visibleTransactions.push(originalTransactions) : visibleTransactions.splice(transactions, 0, originalTransactions)
        },
        s = function(transactions) {
            return transactions.sortBy("sortableIndex")
        };
        for (scheduledTransaction in scheduledTransactions)
            if (_ = visibleTransactions.indexOf(scheduledTransactions[scheduledTransaction]),
            -1 !== _)
                if (n === scheduledTransaction && r.length > 0) {
                    for (A = s(r),
                    d = g = 0,
                    v = A.length; v > g; d = ++g)
                        D = A[d],
                        p(d + _ + 1, D);
                    p(r.length + _ + 1, {
                        type: "split"
                    })
                } else if (subTransactions[scheduledTransaction])
                    for (d = 0,
                    E = s(subTransactions[scheduledTransaction]),
                    f = 0,
                    b = E.length; b > f; f++)
                        D = E[f],
                        D.get("isTombstone") || (d++,
                        p(d + _, D));
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
