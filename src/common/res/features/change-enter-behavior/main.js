function ynabEnhancedChangeEnterBehavior() {
    var addTransaction = document.getElementsByClassName('ynab-grid-add-rows')[0];
    var memoField = addTransaction.getElementsByClassName('ynab-grid-cell-memo')[0].getElementsByClassName('ember-text-field')[0];
    memoField.onkeydown = function(event) {
        var e = event || window.event;
        ynabEnhancedChangeEnterBehaviorClick(e);
    }
    var outflowField = addTransaction.getElementsByClassName('ynab-grid-cell-outflow')[0].getElementsByClassName('ember-text-field')[0];
    outflowField.onkeydown = function(event) {
        var e = event || window.event;
        ynabEnhancedChangeEnterBehaviorClick(e);
    }
    var inflowField = addTransaction.getElementsByClassName('ynab-grid-cell-inflow')[0].getElementsByClassName('ember-text-field')[0];
    inflowField.onkeydown = function(event) {
        var e = event || window.event;
        ynabEnhancedChangeEnterBehaviorClick(e);
    }
    setTimeout(ynabEnhancedChangeEnterBehaviorRemoved, 250);
}

function ynabEnhancedChangeEnterBehaviorClick(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        e.stopPropagation();
        var saveButtons = document.getElementsByClassName('ynab-grid-add-rows')[0].getElementsByClassName('button-primary');
        for (var i = 0; i < saveButtons.length; i++) {
            button = saveButtons[i];
            if ((' ' + button.className + ' ').indexOf(' button-another ') == -1) {
                button.click();
                return;
            }
        }
    }
}

function ynabEnhancedChangeEnterBehaviorInit() {
    var addTransaction = document.getElementsByClassName('ynab-grid-add-rows');
    n = addTransaction.length;
    if (n > 0) {
        ynabEnhancedChangeEnterBehavior();
    } else {
        setTimeout(ynabEnhancedChangeEnterBehaviorInit, 250);
    }
}

function ynabEnhancedChangeEnterBehaviorRemoved() {
    var addTransaction = document.getElementsByClassName('ynab-grid-add-rows');
    n = addTransaction.length;
    if (n == 0) {
        setTimeout(ynabEnhancedChangeEnterBehaviorInit, 250);
    } else {
        setTimeout(ynabEnhancedChangeEnterBehaviorRemoved, 250);
    }
 }

setTimeout(ynabEnhancedChangeEnterBehaviorInit, 250);
