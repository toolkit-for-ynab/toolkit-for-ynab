function ynabEnhancedSelectedTotals() {
    var parent = document.getElementsByClassName("accounts-header-balances")[0];
    var totals = document.createElement("div");
    totals.className = "accounts-header-balances-selected hidden";
    totals.id = "accounts-selected-total";
    var label = document.createElement("div");
    label.className = "accounts-header-balances-label";
    label.innerText = "Selected transactions total"
    totals.appendChild(label);
    parent.appendChild(totals);
    ynabEnhancedSelectedTotalsPoll();
}

function ynabEnhancedSelectedTotalsCalculate() {
    var outflows = 0;
    var inflows = 0;
    var checkboxes = document.getElementsByClassName("ynab-checkbox-button");
    for (var i = 0; i < checkboxes.length; i++) {
        var checkbox = checkboxes[i];
        if ((' ' + checkbox.className + ' ').indexOf(' is-checked ') == -1) {
            continue;
        }
        if ((' ' + checkbox.parentElement.parentElement.className + ' ').indexOf(' ynab-grid-header-cell ') > -1) {
            continue;
        }
        if ((' ' + checkbox.parentElement.parentElement.parentElement.className + ' ').indexOf(' modal-account-filters-flags ') > -1) {
            continue;
        }
        var parent = document.getElementById(checkbox.parentElement.parentElement.parentElement.id);
        var outflow = parent.getElementsByClassName('ynab-grid-cell-outflow')[0].innerText;
        var inflow = parent.getElementsByClassName('ynab-grid-cell-inflow')[0].innerText;
        outflows += ynab.YNABSharedLib.currencyFormatter.convertToFixedPrecision(ynab.YNABSharedLib.currencyFormatter.unformat(outflow));
        inflows += ynab.YNABSharedLib.currencyFormatter.convertToFixedPrecision(ynab.YNABSharedLib.currencyFormatter.unformat(inflow));
        ynabEnhancedSelectedTotalsUpdate(inflows - outflows);
    }

    setTimeout(ynabEnhancedSelectedTotalsPoll, 750);
}

function ynabEnhancedSelectedTotalsUpdate(total) {
    var parent = document.getElementById('accounts-selected-total');
    if (parent == null) {
        return false;
    }
    if ((' ' + parent.className + ' ').indexOf(' hidden ') == -1 && total == 0) {
        parent.className += " hidden";
        return true;
    } else if (total == 0) {
        return true;
    }
    parent.className = "accounts-header-balances-selected";
    var spans = parent.getElementsByClassName("user-data");
    for (var i = 0; i < spans.length; i++) {
        spans[i].remove();
    }
    var totalFormatted = ynabEnhancedFormatCurrency(total);
    var userData = document.createElement("span");
    userData.className = "user-data";
    userData.title = totalFormatted;
    var userCurrency = document.createElement("span");
    userCurrency.className = "user-data currency";
    if (total > 0) {
        userCurrency.className += " positive";
    } else {
        userCurrency.className += " negative";
    }
    userCurrency.innerHTML = totalFormatted;
    userData.appendChild(userCurrency);
    parent.appendChild(userData);
}

function ynabEnhancedFormatCurrency(e) {
    var n, r, a;
    e = ynab.formatCurrency(e);
    n = ynab.YNABSharedLib.currencyFormatter.getCurrency();
    a = Ember.Handlebars.Utils.escapeExpression(n.currency_symbol);
    a = "<bdi>" + a + "</bdi>";
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
    }
    var checkboxes = document.getElementsByClassName('is-checked');
    c = checkboxes.length;
    var checkboxesArray = new Array();
    for (var i = 0; i < c; i++) {
        checkboxesArray.push(checkboxes[i].parentElement.id);
    }
    if (c > 0) {
        if (checkboxesArray.toString() != previousSet.toString()) {
            previousSet = checkboxesArray;
            ynabEnhancedSelectedTotalsCalculate();
        } else {
            setTimeout(ynabEnhancedSelectedTotalsPoll, 750);
        }
    } else {
        if (checkboxesArray.toString() != previousSet.toString()) {
            ynabEnhancedSelectedTotalsUpdate(0);
            previousSet = checkboxesArray;
        }
        setTimeout(ynabEnhancedSelectedTotalsPoll, 750);
    }
}

var previousSet = '';
setTimeout(ynabEnhancedSelectedTotalsInit, 250);
