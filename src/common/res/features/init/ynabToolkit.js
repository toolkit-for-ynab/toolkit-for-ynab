window.ynabToolKit = new function() {

	// Set 'ynabToolKit.debugNodes = true' to print changes the mutationObserver sees
	// during page interactions and updates to the developer tools console.
	this.debugNodes = false,

	// This variable is populated by each active script loaded inside the ynabToolKit object
	this.featureOptions = {},

	// Setting up a single mutationObserver that can be called by each feature
	this.actOnChange = function() {

		MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		var observer = new MutationObserver(function(mutations, observer) {

			if (ynabToolKit.debugNodes) {
				console.log('NEW NODES');
			}

			mutations.forEach(function(mutation) {
				var newNodes = mutation.target;
				if (ynabToolKit.debugNodes) {
					console.log(newNodes);
				}

				var $nodes = $(newNodes); // jQuery set
				$nodes.each(function() {
					var $node = $(this);


						// Changes are detected in the category balances
						if ($node.hasClass("budget-table-cell-available-div")) {

							if ( ynabToolKit.featureOptions.checkCreditBalances ){
								ynabToolKit.checkCreditBalances();
							}
							if ( ynabToolKit.featureOptions.highlightNegativesNegative ){
								ynabToolKit.highlightNegativesNegative();
							}

						} else

						// The user has returned back to the budget screen
						if ($node.hasClass('budget-table-row')) {

							if ( ynabToolKit.featureOptions.checkCreditBalances ){
								ynabToolKit.checkCreditBalances();
							}
							if ( ynabToolKit.featureOptions.highlightNegativesNegative ){
								ynabToolKit.highlightNegativesNegative();
							}
						}

						// We found a modal pop-up
						if ($node.hasClass( "options-shown")) {

							if ( ynabToolKit.featureOptions.removeZeroCategories ) {
								ynabToolKit.removeZeroCategories();
							}
						}

				}); // each node mutation event

			}); // each mutation event

			if (ynabToolKit.debugNodes) {
				console.log('###')
			}

		});

		// This finally says 'Watch for changes' and only needs to be called the one time
		observer.observe($('.ember-view.layout')[0], {
			subtree : true,
			childList : true,
			characterData : true,
			attributeFilter : [ 'class' ]
		});
	};

	// This function returns all visible transactions matching accountId.
	// If accountId === 'null' then all transactions for all accounts are returned with the visibility
	// settings for All accounts applied.
	this.getVisibleTransactions = function(accountId) {
            var e, t, n, r, a, i, o, s, c, l, d, u, h, p, m, g, f, y, v, b, C, _, M, T, w, A, E, x, N, F, I, S, B, D, k, L, P, R, O, Y, V, H;
			if (accountId === 'null') {
				e = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.visibleTransactionDisplayItems;
			} else {
				e = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.transactionDisplayItemsCollection.findItemsByAccountId(accountId);
			}
            n = null;
            t = e;
            if (w = jQuery.parseJSON(localStorage.getItem("." + accountId + "_account_filter")),
            c = w.fromMonth,
            l = w.fromYear,
            L = w.toMonth,
            P = w.toYear,
            M = w.reconciled,
            x = w.scheduled,
            H = w.withNotification,
            F = x,
            null  !== c && null  !== l && (B = new ynab.utilities.DateWithoutTime(l,c).getUTCTime()),
            null  !== L && null  !== P && (i = new ynab.utilities.DateWithoutTime(P,L),
            i.addMonths(1),
            i = i.getUTCTime()),
            h = Object.create(null ),
            k = Object.create(null ),
            N = [],
            R = 0,
            n)
                for (u = m = 0,
                y = t.length; y > m; u = ++m)
                    if (Y = t[u],
                    Y.get("entityId") === n) {
                        t.splice(u, 1, a);
                        break
                    }
            V = t.filter(function(e) {
                var t, r, a, o, s, c, l, d, u, p, m;
                return m = e.getProperties("entityId", "isTombstone", "displayItemType", "date", "cleared", "needsApproval", "needsCategory", "isSplit"),
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
                s !== n && B && B > a || i && a >= i ? !1 : M === !1 && t === ynab.constants.TransactionState.Reconciled ? !1 : "needsApproval" === H && !d || "needsCategory" === H && (!u || d) ? !1 : o === ynab.constants.TransactionDisplayItemType.ScheduledTransaction ? (F && (N.push(e),
                h[s] = e),
                !1) : o === ynab.constants.TransactionDisplayItemType.SubTransaction || o === ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction ? (p = e.get("parentEntityId"),
                Array.isArray(k[p]) || (k[p] = []),
                k[p].push(e),
                !1) : (c && (h[s] = e),
                !0))
            }),
            V.push.apply(V, N),
            p = function(e, t) {
                var n;
                return n = V.length,
                e >= n ? V.push(t) : V.splice(e, 0, t)
            }
            ,
            s = function(e) {
                return e.sortBy("sortableIndex")
            }
            ;
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
	}


}; // end ynabToolKit object

// This poll() function will only need to run until we find that the DOM is ready
// For certain functions, we may run them once automatically on page load before 'changes' occur
(function poll() {
    if (typeof Em !== 'undefined' && typeof Ember !== 'undefined'
          && typeof $ !== 'undefined' && $('.ember-view.layout').length) {


    	if ( ynabToolKit.featureOptions.checkCreditBalances ) {
    	  ynabToolKit.checkCreditBalances();
    	}

    	if ( ynabToolKit.featureOptions.highlightNegativesNegative ){
    		ynabToolKit.highlightNegativesNegative();
    	}

    	// Activate the mutationObserver so we don't need to use setTimeout() anymore
        ynabToolKit.actOnChange();
    } else {
       setTimeout(poll, 250);
    }
 })();
