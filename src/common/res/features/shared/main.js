window.ynabToolKit = new function() {

    // This variable is populated by each active script loaded inside the ynabToolKit object
    this.featureOptions = {},

    //When this is true, the feature scripts will know they are ready to execute
    this.pageReady = {},

    // This function returns all visible transactions matching accountId.
    // If accountId === 'null' then all transactions for all accounts are returned with the visibility
    // settings for All accounts applied.
    this.getVisibleTransactions = function (accountId)  {
        var transactions, t, n, r, a, i, o, s, c, l, d, u, h, p, m, g, f, y, v, b, C, _, M, T, w, A, E, x, N, F, I, S, B, D, k, L, P, R, O, Y, V, H;
        if (accountId === 'null') {
            transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.visibleTransactionDisplayItems;
        } else {
            transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.transactionDisplayItemsCollection.findItemsByAccountId(accountId);
        }
        t = transactions;
        w = jQuery.parseJSON(localStorage.getItem("." + accountId + "_account_filter")),
        c = w.fromMonth,
        l = w.fromYear,
        L = w.toMonth,
        P = w.toYear,
        M = w.reconciled,
        F = w.scheduled,
        H = w.withNotification,
        null  !== c && null  !== l && (B = new ynab.utilities.DateWithoutTime(l,c).getUTCTime()),
        null  !== L && null  !== P && (i = new ynab.utilities.DateWithoutTime(P,L),
        i.addMonths(1),
        i = i.getUTCTime()),
        h = Object.create(null),
        k = Object.create(null),
        N = [],
        R = 0;
        V = transactions.filter(function(transaction) {
            var t, r, a, o, s, c, l, d, u, p, m;
            return m = transaction.getProperties("entityId", "isTombstone", "displayItemType", "date", "cleared", "needsApproval", "needsCategory", "isSplit"),
            s = m.entityId,
            l = m.isTombstone,
            o = m.displayItemType,
            r = m.date,
            t = m.cleared,
            d = m.needsApproval,
            u = m.needsCategory,
            c = m.isSplit,
            l ? (R++,
            !1) : (a = r.getUTCTime(),
            s !== n && B && B > a || i && a >= i ? !1 : M === !1 && t === ynab.constants.TransactionState.Reconciled ? !1 : "needsApproval" === H && !d || "needsCategory" === H && (!u || d) ? !1 : o === ynab.constants.TransactionDisplayItemType.ScheduledTransaction ? (F && (N.push(transaction),
            h[s] = transaction),
            !1) : o === ynab.constants.TransactionDisplayItemType.SubTransaction || o === ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction ? (p = transaction.get("parentEntityId"),
            Array.isArray(k[p]) || (k[p] = []),
            k[p].push(transaction),
            !1) : (c && (h[s] = transaction),
            !0))
        }),
        V.push.apply(V, N),
        p = function(transactions, t) {
            var n;
            return n = V.length,
            transactions >= n ? V.push(t) : V.splice(transactions, 0, t)
        },
        s = function(transactions) {
            return transactions.sortBy("sortableIndex")
        };
        for (C in h)
            if (_ = V.indexOf(h[C]),
            -1 !== _)
                if (n === C && r.length > 0) {
                    for (A = s(r),
                    d = g = 0,
                    v = A.length; v > g; d = ++g)
                        D = A[d],
                        p(d + _ + 1, D);
                    p(r.length + _ + 1, {
                        type: "split"
                    })
                } else if (k[C])
                    for (d = 0,
                    E = s(k[C]),
                    f = 0,
                    b = E.length; b > f; f++)
                        D = E[f],
                        D.get("isTombstone") || (d++,
                        p(d + _, D));
        return V;
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
