(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.swapClearedFlagged = (function () {
      return {
        invoke() {
          function swapElements(elm1, elm2) {
            var parent1 = elm1.parentNode;
            var next1 = elm1.nextSibling;
            var parent2 = elm2.parentNode;
            var next2 = elm2.nextSibling;

            parent1.insertBefore(elm2, next1);
            parent2.insertBefore(elm1, next2);
          }

          function getChildNumber(node) {
            return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
          }

          var flags = $('.ynab-grid-cell-flag');
          var cleared = $('.ynab-grid-cell-cleared');

          for (var i = 0; i < flags.length; i += 1) {
            // If not swapped
            if (getChildNumber(cleared[i]) - getChildNumber(flags[i]) > 0) {
              swapElements(flags[i], cleared[i]);
            }
          }
        },

        observe(changedNodes) {
          if (changedNodes.has('ynab-grid-body')) {
            // We found Account transactions rows
            ynabToolKit.swapClearedFlagged.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
