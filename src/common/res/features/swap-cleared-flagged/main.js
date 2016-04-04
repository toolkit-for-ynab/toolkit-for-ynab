(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.swapClearedFlagged = (function(){

      return {
        invoke: function() {
          function swapElements(elm1, elm2) {
              var parent1, next1,
                  parent2, next2;

              parent1 = elm1.parentNode;
              next1   = elm1.nextSibling;
              parent2 = elm2.parentNode;
              next2   = elm2.nextSibling;

              parent1.insertBefore(elm2, next1);
              parent2.insertBefore(elm1, next2);
          }

          function getChildNumber(node) {
            return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
          }

          flags = $(".ynab-grid-cell-flag");
          cleared = $(".ynab-grid-cell-cleared");

          for (i = 0; i < flags.length; i += 1) {
            // If not swapped
            if (getChildNumber(cleared[i]) - getChildNumber(flags[i]) == 16) {
              swapElements(flags[i], cleared[i]);
            }
          }
        },

        swapYnabGridActions: function() {
          $('.ember-view.ynab-grid-body-row.is-editing .ember-view.ynab-grid-actions').css({
            "right" : 36,
            "bottom" : -35
          })

          var ynabGridActions = $('.ember-view.ynab-grid-actions').detach();
          var splitTransaction = $('.button.button-primary.ynab-grid-split-add-sub-transaction');

          if ( splitTransaction.length ) {
            splitTransaction.parent().parent()
            .find('.ynab-grid-cell.ynab-grid-cell-flag')
            .append(ynabGridActions)
          } else {
            $('.ember-view.ynab-grid-body-row.is-editing .ynab-grid-cell.ynab-grid-cell-flag')
            .append(ynabGridActions)
          }
        },

        observe: function(changedNodes) {
          if (changedNodes.has('ynab-grid-body')) {
            // We found Account transactions rows
            ynabToolKit.swapClearedFlagged.invoke();

            if ( $('.ember-view.ynab-grid-actions') ) {
              ynabToolKit.swapClearedFlagged.swapYnabGridActions();
            }
          }
        }
      };
    })(); // Keep feature functions contained within this object

  } else {
    setTimeout(poll, 250);
  }
})();