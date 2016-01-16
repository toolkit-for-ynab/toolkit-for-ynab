// DoB means Days of Buffering

function ynabEnhancedDoB() {
    var YNABheader = document.getElementsByClassName("budget-header-flexbox")[0];
    var elementForAoM = document.getElementsByClassName("budget-header-days")[0];
    var elementForDoB = elementForAoM.cloneNode(true);

    var result = ynabEnhancedDoBCalculate();
    elementForDoB.children[0].textContent = result["DoB"] + " day" + (result["DoB"] == 1 ? "" : "s");
    elementForDoB.children[0].className = elementForDoB.children[0].className + " days-of-budgeting";
    elementForDoB.children[0].title = "Total outflow: " + ynab.YNABSharedLib.currencyFormatter.format(result["totalOutflow"]) + 
        "\nTotal days of budgeting: " + result["totalDays"] + 
        "\nAverage daily outflow: ~" + ynab.YNABSharedLib.currencyFormatter.format(result["averageDailyOutflow"]) + 
        "\nAverage daily transactions: " + result["averageDailyTransactions"].toFixed(1);
    elementForDoB.children[1].textContent = "Days of Buffering";
    elementForDoB.children[1].className = elementForDoB.children[1].className + " days-of-budgeting"
    elementForDoB.children[1].title = "Don't like AoM? Try this out instead!";
    elementForDoB.className = elementForDoB.className.replace(/\bhidden\b/,'');

    YNABheader.appendChild(elementForDoB);
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function ynabEnhancedCheckTransactionTypes(transactions) {
    // Describe all handled transaction types and check that no other got.
    var handeledTransactionTypes = ["subTransaction", "transaction", "scheduledTransaction", "scheduledSubTransaction"];
    var uniqueTransactionTypes = Array.from(transactions, (el) => el.displayItemType).filter(onlyUnique);
    var allTypesHandeled = uniqueTransactionTypes.every(el => uniqueTransactionTypes.includes(el)); 
    if (!allTypesHandeled) {
        throw "Found unhandeled transaction type. " + uniqueTransactionTypes;
    }  
}

function ynabEnhancedDoBCalculate() {
    var accounts = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result;

    var firstTransactionDate = accounts.minTransactionDate._internalUTCMoment._d;
    var lastTransactionDate = accounts.maxTransactionDate._internalUTCMoment._d;
    var totalDays = (lastTransactionDate - firstTransactionDate)/3600/24/1000;

    var transactions = accounts.visibleTransactionDisplayItems;
    ynabEnhancedCheckTransactionTypes(transactions);
    // All subTransaction (comes from split) have their parent transaction so they shouldn't count.
    // scheduledTransaction shouldn't count too because they are not paid.
    var outflow_transactions = transactions.filter((el) => el.displayItemType == "transaction" 
                                                    && el.transferAccountId == null 
                                                    && el.outflow > 0
                                                    && el.getAccount().onBudget);
    var totalOutflow = Array.from(outflow_transactions, (i) => i.outflow).reduce((a, b) => a + b, 0);
    var averageDailyOutflow = totalOutflow / totalDays;
    var budgetAccountsTotal = ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel()._result.getOnBudgetAccountsBalance();
    return {
        DoB: Math.floor(budgetAccountsTotal/averageDailyOutflow),
        totalOutflow: totalOutflow,
        totalDays: totalDays,
        averageDailyOutflow: averageDailyOutflow,
        averageDailyTransactions: transactions.length/totalDays,
    }
}

function ynabEnhancedDoBInit() {
    var elementForAoM = document.getElementsByClassName("budget-header-days");
    var elementForDoB = document.getElementsByClassName('days-of-budgeting');
    if (elementForAoM.length == 1 && elementForDoB.length == 0) {
        ynabEnhancedDoB();
    }
    
    setTimeout(ynabEnhancedDoBInit, 250);
}

setTimeout(ynabEnhancedDoBInit, 250);
