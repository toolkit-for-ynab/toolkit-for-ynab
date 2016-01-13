function ynabEnhancedSelectedTotals() {
    var parent = document.getElementsByClassName("accounts-header-balances")[0];
    var totals = document.createElement("div");
    totals.className = "accounts-header-balances-selected hidden";
    totals.id = "accounts-selected-total";
    var label = document.createElement("div");
    label.className = "accounts-header-balances-label";
    label.textContent = "Selected Transactions Total";
    totals.appendChild(label);
    parent.appendChild(totals);
    var dataSetParent = document.getElementsByClassName('ynab-grid-body')[0].getElementsByClassName('ynab-grid-body-row');
    for (var i = 0; i < dataSetParent.length; i++) {
        dataSet.push(dataSetParent[i].id);
    }
    ynabEnhancedSelectedTotalsPoll();
}

function ynabEnhancedSelectedTotalsCalculate() {
    var outflows = 0;
    var inflows = 0;
    var transactionsFound = false;
    var accountId, transactions;
    accountId = 'null';
    if (currentPath.indexOf('/accounts/') > -1) {
        accountId = currentPath.substr(currentPath.lastIndexOf('/') + 1)
    }
    transactions = ynabToolKit.getVisibleTransactions(accountId);
    for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].isChecked) {
            inflows += transactions[i].inflow;
            outflows += transactions[i].outflow;
            transactionsFound = true;
        }
    }
    var total = inflows - outflows;
    if (!transactionsFound) {
        total = false;
    }
    ynabEnhancedSelectedTotalsUpdate(total);

    setTimeout(ynabEnhancedSelectedTotalsPoll, 750);
}

function ynabEnhancedSelectedTotalsUpdate(total) {
    var parent = document.getElementById('accounts-selected-total');
    if (parent == null) {
        return false;
    }
    if ((' ' + parent.className + ' ').indexOf(' hidden ') == -1 && total === false) {
        parent.className += " hidden";
        return true;
    } else if (total === false) {
        return true;
    }
    parent.className = "accounts-header-balances-selected";
    var spans = parent.getElementsByClassName("user-data");
    for (var i = 0; i < spans.length; i++) {
        spans[i].remove();
    }
    var totalFormatted = ynabEnhancedFormatCurrency(total, true);
    var totalFormattedNoHtml = ynabEnhancedFormatCurrency(total, false);
    var userData = document.createElement("span");
    userData.className = "user-data";
    userData.title = totalFormattedNoHtml;
    var userCurrency = document.createElement("span");
    userCurrency.className = "user-data currency";
    if (total >= 0) {
        userCurrency.className += " positive";
    } else {
        userCurrency.className += " negative";
    }
    userCurrency.innerHTML = totalFormatted;
    userData.appendChild(userCurrency);
    parent.appendChild(userData);
}

function ynabEnhancedFormatCurrency(e, html) {
    var n, r, a;
    e = ynab.formatCurrency(e);
    n = ynab.YNABSharedLib.currencyFormatter.getCurrency();
    a = Ember.Handlebars.Utils.escapeExpression(n.currency_symbol);
    if (html) {
        a = "<bdi>" + a + "</bdi>";
    }
    n.symbol_first ? (r = "-" === e.charAt(0), e = r ? "-" + a + e.slice(1) : a + e) : e += a;
    return new Ember.Handlebars.SafeString(e);
}

function ynabEnhancedSelectedTotalsInit() {
    var parentDiv = document.getElementsByClassName('accounts-header-balances');
    n = parentDiv.length;
    if (n > 0) {
        ynabEnhancedSelectedTotals();
    } else {
        setTimeout(ynabEnhancedSelectedTotalsInit, 250);
    }
}

function ynabEnhancedSelectedTotalsPoll() {
    var parentDiv = document.getElementsByClassName('accounts-header-balances');
    if (parentDiv.length == 0) {
        setTimeout(ynabEnhancedSelectedTotalsInit, 250);
        return true;
    }
    var accountId, transactions;
    var checkedTransactions = new Array();
    var windowPath = window.location.pathname;
    var newDataSetParent = document.getElementsByClassName('ynab-grid-body')[0].getElementsByClassName('ynab-grid-body-row');
    var newDataSet = new Array();
    for (var i = 0; i < newDataSetParent.length; i++) {
        newDataSet.push(newDataSetParent[i].id);
    }
    if (windowPath != currentPath || newDataSet.toString() != dataSet.toString()) {
        currentPath = windowPath;
        previousSet = '';
        dataSet = newDataSet;
        ynabEnhancedSelectedTotalsUpdate(-1);
    }
    if (currentPath.indexOf('/accounts/') > -1) {
        accountId = currentPath.substr(currentPath.lastIndexOf('/') + 1)
        transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.transactionDisplayItemsCollection.findItemsByAccountId(accountId);
    } else {
        transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.visibleTransactionDisplayItems;
    }
    for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].isChecked) {
            checkedTransactions.push(transactions[i].entityId);
        }
    }
    if (checkedTransactions.length == 0) {
        ynabEnhancedSelectedTotalsUpdate(false);
        previousSet = checkedTransactions;
    } else {
        if (checkedTransactions.toString() != previousSet.toString()) {
            previousSet = checkedTransactions;
            ynabEnhancedSelectedTotalsCalculate();
            return true;
        }
    }
    setTimeout(ynabEnhancedSelectedTotalsPoll, 250);
}
var currentPath = window.location.pathname;
var previousSet = '';
var dataSet = new Array();
setTimeout(ynabEnhancedSelectedTotalsInit, 250);
