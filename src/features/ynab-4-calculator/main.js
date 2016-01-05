function injectInitializer() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined') {

    $(document).on('keypress', 'li.budget-table-cell-budgeted div.currency-input', function(e) {

      e = e || window.event;
      var charCode = e.which || e.keyCode;
      var charTyped = String.fromCharCode(charCode);

      if (charTyped == '+' ||
          charTyped == '-' ||
          charTyped == '*' ||
          charTyped == '/')
      {
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
