function injectInitializer() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined') {

    (function ($) {
      var currentValue;
      var currentOperation;
      var selector = 'div.ynab-grid-add-rows div.ynab-grid-cell-outflow div.currency-input, ' +
                     'div.ynab-grid-add-rows div.ynab-grid-cell-inflow div.currency-input';

      $(document).on('keyup', selector, function (e) {
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

          if (currentOperation) {
            var inputSplit = input.val().split((/\+|\-|\/|\*/));
            var newVal = performCalculation.apply(null, inputSplit);
            input.val(newVal);
            input.trigger('change');
            currentOperation = charTyped;

            // put the cursor at the end of the input box now
            input[0].focus();
            input[0].setSelectionRange(length, length);
          } else {
            currentOperation = charTyped;
          }
        }

        // Make sure we allow the event to bubble up so we don't mess with anything
        // that YNAB is doing.
      });

      $(document).on('blur', selector, function () {
        var input = $(this).find('input');

        if (currentOperation) {
          var inputSplit = input.val().split((/\+|\-|\/|\*/));
          var newVal = performCalculation.apply(null, inputSplit);
          input.val(newVal);
          input.trigger('change');
          currentOperation = null;
        }

        // Make sure we allow the event to bubble up so we don't mess with anything
        // that YNAB is doing.
      });

      function performCalculation(numberOne, numberTwo) {
        numberOne = parseFloat(numberOne);
        numberTwo = parseFloat(numberTwo);

        if (isNaN(numberOne) || isNaN(numberTwo)) {
          return 0;
        }

        switch (currentOperation) {
          case '+': return numberOne + numberTwo;
          case '-': return numberOne - numberTwo;
          case '*': return numberOne * numberTwo;
          case '/': return numberOne / numberTwo;
        }
      }
    })(jQuery);
  } else {
    setTimeout(injectInitializer, 250);
  }
}

setTimeout(injectInitializer, 250);
