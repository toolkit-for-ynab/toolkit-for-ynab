function injectInitializer() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined') {

    $(document).on('keydown', 'li.budget-table-cell-budgeted div.currency-input', function(e) {

      var characters = [
        187, // +
        189, // -
        191, // /
        56   // *
      ];

      if (characters.indexOf(e.which) > -1) {
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
