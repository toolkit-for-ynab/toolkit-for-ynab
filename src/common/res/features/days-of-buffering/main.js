// DoB means Days of Buffering

function ynabEnhancedDoB() {
    var YNABheader = document.getElementsByClassName("budget-header-flexbox")[0];
    var elementForAoM = document.getElementsByClassName("budget-header-days")[0];
    var elementForDoB = elementForAoM.cloneNode(true);

    var DoB = ynabEnhancedDoBCalculate();
    elementForDoB.children[0].innerText = DoB + " day" + (DoB == 1 ? "" : "s");
    elementForDoB.children[0].className = elementForDoB.children[0].className + " days-of-budgeting";
    elementForDoB.children[1].innerText = "Days of Buffering";
    elementForDoB.children[1].title = "Don't like AoM? Here you are this new shiny metric! Shows how many days you can live without income on your budget total considering average daily outflow";    

    YNABheader.appendChild(elementForDoB);
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function ynabEnhancedCheckTransactionTypes(transactions) {
    // There must be exactly 3 types that are described.
    var uniqueTransactionTypes = Array.from(transactions, (el) => el.displayItemType).filter(onlyUnique);
    var handeledTransactionTypes = ["subTransaction", "transaction", "scheduledTransaction"];
    var allTypesHandeled = (uniqueTransactionTypes.length == handeledTransactionTypes.length) && 
        uniqueTransactionTypes.every(function(element, index) {
            return element === handeledTransactionTypes[index]; 
        }); 
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
                                                    && el.outflow > 0);
    var totalOutflow = Array.from(outflow_transactions, (i) => i.outflow).reduce((a, b) => a + b, 0);
    var averageDailyOutflow = totalOutflow / totalDays;
    var budgetAccountsTotal = ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel()._result.getOnBudgetAccountsBalance();
    return Math.floor(budgetAccountsTotal/averageDailyOutflow);
}

function ynabEnhancedDoBInit() {
    var elementForDoB = document.getElementsByClassName('days-of-budgeting');
    if (elementForDoB.length == 0) {
        ynabEnhancedDoB();
    } else {
        setTimeout(ynabEnhancedDoBInit, 250);
    }
}

setTimeout(ynabEnhancedDoBInit, 250);
