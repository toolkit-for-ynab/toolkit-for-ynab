(function poll() { 
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.featureOptions.swapClearedFlagged = true;
    ynabToolKit.swapClearedFlagged = function ()  { // Keep feature functions contained within this

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

    }; // Keep feature functions contained within this
    ynabToolKit.swapClearedFlagged(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);  
  }
})();
