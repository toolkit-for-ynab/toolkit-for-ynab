function injectInitializer() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined') {

    $(document).on('keydown', 'li.budget-table-cell-budgeted div.currency-input', function(e) {

      if ((e.which == 187 && e.shiftKey) || // + on main keyboard
           e.which == 189                || // - on main keyboard
           e.which == 191                || // / on main keyboard
          (e.which == 56  && e.shiftKey) || // * on main keyboard
           e.which == 107                || // + on number pad
           e.which == 109                || // - on number pad
           e.which == 111                || // / on number pad
           e.which == 106                   // * on number pad
      ) {
        var input = $(this).find('input');
        var length = input.val().length;

        // This moves the caret to the end of the input.
        input[0].focus();
        input[0].setSelectionRange(length, length);
      }

      // Make sure we allow the event to bubble up so we don't mess with anything
      // that YNAB is doing.
    })

  } else {
    setTimeout(injectInitializer, 250);
  }
}

setTimeout(injectInitializer, 250);
