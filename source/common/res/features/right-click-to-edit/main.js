(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.rightClickToEdit = (function () {
      var isCurrentlyRunning = false;

      // Supporting functions,
      // or variables, etc
      function displayContextMenu(event) {
        var $element = $(this);
        // check for a right click on a split transaction
        if ($element.hasClass('ynab-grid-body-sub')) {
          // select parent transaction
          $element = $element.prevAll('.ynab-grid-body-parent:first');
        }

        if (!$element.hasClass('is-checked')) {
          // clear existing, then check current
          $('.ynab-checkbox-button.is-checked').click();
          $element.find('.ynab-checkbox-button').click();
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
        if (event.pageY + height > $(window).height()) below = false;

        // move context menu
        var offset = $element.offset();
        if (below) {
          // position below
          $('.modal-account-edit-transaction-list .modal')
            .addClass('modal-below')
            .css('left', event.pageX - 115)
            .css('top', offset.top + 41);
        } else {
          // position above
          $('.modal-account-edit-transaction-list .modal')
            .addClass('modal-above')
            .css('left', event.pageX - 115)
            .css('top', offset.top - height - 8);
        }

        return false;
      }

      function hideContextMenu() {
        // ignore right clicks
        return false;
      }

      return {
        invoke() {
          isCurrentlyRunning = true;

          Ember.run.next(function () {
            $('.ynab-grid').off('contextmenu', '.ynab-grid-body-row', displayContextMenu);
            $('.ynab-grid').on('contextmenu', '.ynab-grid-body-row', displayContextMenu);

            $('body').off('contextmenu', '.modal-account-edit-transaction-list', hideContextMenu);
            $('body').on('contextmenu', '.modal-account-edit-transaction-list', hideContextMenu);

            isCurrentlyRunning = false;
          });
        },

        observe(changedNodes) {
          if (changedNodes.has('ynab-grid-body') && !isCurrentlyRunning) {
            ynabToolKit.rightClickToEdit.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.rightClickToEdit.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
