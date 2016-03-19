(function poll() {
	if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
		//
		// Keep feature functions contained in the function below!
		//
  		ynabToolKit.adjustAccountsRowHeight = new function () {
			/**
				This function is temporary. It's purpose is to show how certain values
				are set when the "default" option is selected for this feature. That
				allows for comparison between how this feature sets the values and 
				how YNAB sets them.
			*/
			this.invoke = function() {
				console.log( "tracking:top of invoke()" );
				/*
				App = Ember.Application;//.create({});
				App.IndexController = Ember.ObjectController.extend({
				  recordsBufferAdjust: 2.5,
				  recordsBufferAdjustDidChange: function() {
					 console.log(this.get('recordsBufferAdjust'));
				  }.observes('view:ynab-grid-container:recordsBufferAdjust')
				});
				*/
				var grid = Ember.View.views[Ember.keys(Ember.View.views)[0]].container.lookup('view:ynab-grid/index');
				console.log( "grid.recordHeight: " + grid.get('recordHeight') );
				console.log( "ynab-grid-body-row count: " + $('.ynab-grid-body-row').length );
				console.log( "tracking:end of invoke()" );
			},
			this.process = function() {
				console.log( "tracking:top of process()" );
				console.log( "ynab-grid-container height: " + $('.ynab-grid-container').css('height') );
				console.log( "ynab-grid-body-row-top height: " + $('.ynab-grid-body-row-top').css('height') );
				console.log( "ynab-grid-body-row-bottom height: " + $('.ynab-grid-body-row-bottom').css('height') );
				console.log( "ynab-grid-body-row count: " + $('.ynab-grid-body-row').length );
				console.log( "tracking:end of proess()" );
			},
			this.observe = function( changedNodes ) {
				if ( changedNodes.has( 'ynab-grid-body' ) ) {
					console.log( "calling process()" );
					ynabToolKit.adjustAccountsRowHeight.process();

					var cdate = new Date();
					console.log( "---###--- " + cdate.toLocaleTimeString() );
				}
			}
		}; 
		//
		// Keep feature functions contained within the function above!
		//
		console.log( "calling invoke()" );
		ynabToolKit.adjustAccountsRowHeight.invoke(); // Run script once on page load
	} else {
		setTimeout(poll, 250);  
  }
})();
