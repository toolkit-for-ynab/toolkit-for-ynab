(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.rightClickToEdit = (function(){

      // Supporting functions,
      // or variables, etc
      function displayContextMenu(element, e)
      {
		// clear all toggled checkboxes
		$('.ynab-checkbox-button.is-checked').click();

      	// toggle checkbox
      	if ($(element).hasClass('ynab-grid-body-sub'))
      	{
      		// select parent transaction to toggle
      		$(element).prevAll('.ynab-grid-body-parent:first').find('.ynab-checkbox-button').click();
      	}
      	else {
      		// select current transaction to toggle
	      	$(element).find('.ynab-checkbox-button').click();
      	}

      	// make context menu appear
      	$('.accounts-toolbar-edit-transaction').click();

      	// hide disabled buttons and dividers above them
      	var parents = $('.modal-account-edit-transaction-list .modal-list .button-disabled').parent();
      	var above = $(parents).prev();
      	$(parents).hide();
      	$(above).hide();

      	// determine if modal needs to be positioned above or below clicked element
      	var below = true;
      	var height = $('.modal-account-edit-transaction-list .modal').outerHeight();
      	if (e.pageY + height > $(window).height()) below = false;

      	// move context menu
      	var offset = $(element).offset();
      	if (below)
      	{
      		// position below
      		$('.modal-account-edit-transaction-list .modal')
	    		.addClass('modal-below')
      			.css('left', e.pageX - 115)
	      		.css('top', offset.top + 41);
	    }
	    else
	    {
	    	// position above
	    	$('.modal-account-edit-transaction-list .modal')
	    		.addClass('modal-above')
    			.css('left', e.pageX - 115)
    			.css('top', offset.top - height - 8);
	    }
      }

      function hideContextMenu()
      {
        // ignore right clicks
      	return false;
      }

      return {
        invoke: function() {
          $('.ynab-grid').on('contextmenu', '.ynab-grid-body-row', function(e) { displayContextMenu(this, e); return false; });
      		$('body').on('contextmenu', '.modal-account-edit-transaction-list', hideContextMenu);
        },

        observe: function(changedNodes) {
          if (changedNodes.has('ynab-grid-body')) {
        		ynabToolKit.rightClickToEdit.invoke();
        	}
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.rightClickToEdit.invoke(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);
  }
})();
