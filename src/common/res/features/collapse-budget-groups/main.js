// TODO: Consider refactoring with example.js logic.
(function poll() {
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.collapseBudget = function ()  {


     $(document).on('click', '.undo-redo-container', function(e) {
        var container = $('.undo-redo-container');
        var min = container.offset().left + container.outerWidth() - 2;
        var max = min + 28;

        if (e.pageX >= min && e.pageX <= max) {
          collapseGroups();
        }
      });

      function collapseGroups() {
        var collapsed = false;
        var rows = $('.budget-content').find('.is-master-category');

        if (rows.length) {
          collapsed = $(rows[0]).hasClass('is-collapsed');

          handleGroups(collapsed);
          handleItems(collapsed);
        }
      }

      function handleGroups(collapsed) {
        var rows = $('.budget-content').find('.is-master-category');

        for (i = 0; i < rows.length; i++) {
          if (collapsed) {
            $(rows[i]).removeClass('is-collapsed');
            $(rows[i]).find('.budget-table-cell-name-static-width')
              .find('.button').removeClass('right').addClass('down');
          } else {
            $(rows[i]).addClass('is-collapsed');
            $(rows[i]).find('.budget-table-cell-name-static-width')
              .find('.button').removeClass('down').addClass('right');
          }
        }
      }

      function handleItems(collapsed) {
        var rows = $('.budget-content').find('.is-sub-category');

        for (i = 0; i < rows.length; i++) {
          if (collapsed) {
            $(rows[i]).show();
          } else {
            $(rows[i]).hide();
          }
        }
      }

    };
    setTimeout(ynabToolKit.collapseBudget, 250); // Call itself

  } else {
    setTimeout(poll, 250);
  }
})();
