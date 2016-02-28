(function poll() {
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.changeEnterBehavior = function ()  {

        function changeEnterBehaviorApply() {
            var addTransaction = document.getElementsByClassName('ynab-grid-add-rows')[0];
            var memoField = addTransaction.getElementsByClassName('ynab-grid-cell-memo')[0].getElementsByClassName('ember-text-field')[0];
            memoField.onkeydown = function(event) {
                var e = event || window.event;
                changeEnterBehaviorClick(e);
            };
            var outflowField = addTransaction.getElementsByClassName('ynab-grid-cell-outflow')[0].getElementsByClassName('ember-text-field')[0];
            outflowField.onkeydown = function(event) {
                var e = event || window.event;
                changeEnterBehaviorClick(e);
            };
            var inflowField = addTransaction.getElementsByClassName('ynab-grid-cell-inflow')[0].getElementsByClassName('ember-text-field')[0];
            inflowField.onkeydown = function(event) {
                var e = event || window.event;
                changeEnterBehaviorClick(e);
            };
            setTimeout(changeEnterBehaviorRemoved, 250);
        }

        function changeEnterBehaviorClick(e) {
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

        function changeEnterBehaviorInit() {
            var addTransaction = document.getElementsByClassName('ynab-grid-add-rows');
            n = addTransaction.length;
            if (n > 0) {
                changeEnterBehaviorApply();
            } else {
                setTimeout(changeEnterBehaviorInit, 250);
            }
        }

        function changeEnterBehaviorRemoved() {
            var addTransaction = document.getElementsByClassName('ynab-grid-add-rows');
            n = addTransaction.length;
            if (n === 0) {
                setTimeout(changeEnterBehaviorInit, 250);
            } else {
                setTimeout(changeEnterBehaviorRemoved, 250);
            }
        }
        setTimeout(changeEnterBehaviorInit, 250);

    };
    ynabToolKit.changeEnterBehavior(); // Activate itself

  } else {
    setTimeout(poll, 250);
  }
})();
