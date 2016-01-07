function injectCollapseBudgetInitializer() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined') {
    (function($) {
      $.event.special.destroyed = {
        remove: function(o) {
          if (o.handler) {
            o.handler();
          }
        },
      };
    })(jQuery);

    $(document).on('click', '.undo-redo-container', function(e) {
      if (e.offsetX > this.offsetLeft + this.offsetWidth) {
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
  } else {
    setTimeout(injectCollapseBudgetInitializer, 250);
  }
}

setTimeout(injectCollapseBudgetInitializer, 250);
