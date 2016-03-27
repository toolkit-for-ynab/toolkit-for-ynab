(function poll() {
// Waits until an external function gives us the all clear that we can run (at /shared/main.js)
if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

  ynabToolKit.adjustAccountsRowHeight = (function(){

    // Supporting functions,
    // or variables, etc

    return {      
      invoke: function() {
				var parents = document.getElementsByClassName( "ynab-grid-body-row-top" );
				if ( parents.length ) // restrict this activity to account registers
				{				
					//
					// Add the toolkit class name to the header row so the height can be overridden
					// in CSS.
					//
					for ( var i = 0, ii = parents.length; i < ii; i++ ) {
						var children = parents[i].children;

						for ( var j = 0, jj = children.length; j < jj; j++ ) {
							var elem = children[j];
							elem.classList.add( "toolkit-ynab-grid-cell" );
						}
					}
				}
      },

      observe: function(changedNodes) {

        if ( changedNodes.has('ynab-grid-body') ) {
          ynabToolKit.adjustAccountsRowHeight.invoke();
        }
      }
    };
  })(); // Keep feature functions contained within this object

  ynabToolKit.adjustAccountsRowHeight.invoke(); // Run your script once on page load

} else {
  setTimeout(poll, 250);
}
})();
