// DoB means Days of Buffering

function ynabEnhancedDoB() {
    var YNABheader = document.getElementsByClassName("budget-header-flexbox")[0];
    var elementForAoM = document.getElementsByClassName("budget-header-days")[0];
    var elementForDoB = elementForAoM.cloneNode(true);

    elementForDoB.className = elementForDoB.className + " days-of-buffering";
    elementForDoB.children[1].textContent = "Days of Buffering";
    elementForDoB.children[1].title = "Don't like AoM? Try this out instead!";

    var calculation = ynabEnhancedDoBCalculate();
    if (!calculation){
        elementForDoB.children[0].textContent = "???";
        elementForDoB.children[0].title = "Your budget history is less than 15 days. Go on with YNAB a while.";
    }
    else {
        elementForDoB.children[0].textContent = calculation["DoB"] + " day" + (calculation["DoB"] == 1 ? "" : "s");
        elementForDoB.children[0].title = "Total outflow: " + ynab.YNABSharedLib.currencyFormatter.format(calculation["totalOutflow"]) + 
            "\nTotal days of budgeting: " + calculation["totalDays"] + 
            "\nAverage daily outflow: ~" + ynab.YNABSharedLib.currencyFormatter.format(calculation["averageDailyOutflow"]) + 
            "\nAverage daily transactions: " + calculation["averageDailyTransactions"].toFixed(1);        
    }

    YNABheader.appendChild(elementForDoB);
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function ynabEnhancedCheckTransactionTypes(transactions) {
    // Describe all handled transaction types and check that no other got.
    var handeledTransactionTypes = ["subTransaction", "transaction", "scheduledTransaction", "scheduledSubTransaction"];
    var uniqueTransactionTypes = Array.from(transactions, function(el) { return el.displayItemType }).filter(onlyUnique);
    var allTypesHandeled = uniqueTransactionTypes.every(function(el) { return uniqueTransactionTypes.includes(el) });
    if (!allTypesHandeled) {
        throw "Found unhandeled transaction type. " + uniqueTransactionTypes;
    }  
}

function ynabEnhancedDoBCalculate() {
    // Get outflow transactions.
    var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
    var transactions = entityManager.getAllTransactions();
    var outflowTransactions = transactions.filter(function(el) { return !el.isTombstone
                                                        && el.transferAccountId == null
                                                        && el.amount < 0
                                                        && el.getAccount().onBudget });

    // Filter outflow transactions by Date for history lookup option.
    if (ynabToolKit.options.daysOfBufferingHistoryLookup > 0) {
        dateNow = Date.now();
        var outflowTransactions = outflowTransactions.filter(function (el) {
            return (dateNow - el.getDate().getUTCTime()) / 3600/24/1000/(365/12) < ynabToolKit.options.daysOfBufferingHistoryLookup })
    }

    // Get outflow transactions period
    outflowTransactionsDates = Array.from(outflowTransactions, function (el) { return el.getDate().getUTCTime() });
    var firstTransactionDate = Math.min.apply(null, outflowTransactionsDates);
    var lastTransactionDate = Math.max.apply(null, outflowTransactionsDates);
    var totalDays = (lastTransactionDate - firstTransactionDate)/3600/24/1000;
    if (totalDays < 15){
        return false;
    }

    var totalOutflow = Array.from(outflowTransactions, function (i) { return -i.amount; }).reduce(function (a, b) { return a + b; }, 0);
    var averageDailyOutflow = totalOutflow / totalDays;
    var budgetAccountsTotal = ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel()._result.getOnBudgetAccountsBalance();
    return {
        DoB: Math.floor(budgetAccountsTotal/averageDailyOutflow),
        totalOutflow: totalOutflow,
        totalDays: totalDays,
        averageDailyOutflow: averageDailyOutflow,
        averageDailyTransactions: outflowTransactions.length/totalDays,
    }
}

function ynabEnhancedDoBInit() {
    var elementForAoM = document.getElementsByClassName("budget-header-days");
    var elementForDoB = document.getElementsByClassName('days-of-buffering');
    if (elementForAoM.length == 1 && elementForDoB.length == 0) {
        ynabEnhancedDoB();
    }

    setTimeout(ynabEnhancedDoBInit, 250);
}

setTimeout(ynabEnhancedDoBInit, 250);
