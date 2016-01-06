function injectInitializer() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined') {

    (function($){
      var selector = 'li.budget-table-cell-budgeted div.currency-input, ' +
                     'div.ynab-grid-cell-outflow div.currency-input, ' +
                     'div.ynab-grid-cell-inflow div.currency-input';

      $(document).on('keypress', selector, function(e) {
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
    })(jQuery)
  } else {
    setTimeout(injectInitializer, 250);
  }
}

setTimeout(injectInitializer, 250);
