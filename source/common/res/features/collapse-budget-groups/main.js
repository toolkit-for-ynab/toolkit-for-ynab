// TODO: Consider refactoring with example.js logic.
(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.collapseBudget = function ()  {

      $(document).on('click', '.undo-redo-container', function (e) {

        var container = $('.undo-redo-container');
        var min = container.offset().left + container.outerWidth() - 2;
        var max = min + 28;

        if (e.pageX >= min && e.pageX <= max) {

          // if some sections are already hidden, expand all
          if ($('.is-master-category .budget-table-cell-name-static-width button.right').length)
          {
            $('.is-master-category .budget-table-cell-name-static-width button.right').click();
          }

          // if all sections are visible, collapse all
          else
          {
            $('.is-master-category .budget-table-cell-name-static-width button.down').click();
          }

        }
      });

    };

    setTimeout(ynabToolKit.collapseBudget, 250); // Call itself

  } else {
    setTimeout(poll, 250);
  }
})();
