(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.accountPopupCalculator = (function () {
      function focusHandler() {
        if ($(this).prop('placeholder') === 'outflow' || $(this).prop('placeholder') === 'inflow') {
          ynabToolKit.popupCalculator.setButtonBottom(-242);
          ynabToolKit.popupCalculator.setEntryField($('#' + $(this).attr('id')));
          ynabToolKit.popupCalculator.setInsertAfterElement('div.is-editing div.ynab-grid-actions');
          ynabToolKit.popupCalculator.setSetValueCallback(setValue);
          ynabToolKit.popupCalculator.setGetValueCallback(getValue);

          if (!$('#toolkit-popup-calc-button').length) {
            let $grid = '#' + $('div.ynab-grid-actions').attr('id');
            ynabToolKit.accountPopupCalculator.$calcBtn.prependTo($($grid));

            $('#toolkit-popup-calc-button').prop('disabled', false);
            $('#toolkit-popup-calc-button').removeClass('toolkit-popup-calc-button-hide  toolkit-button-primary');
          }
        } else {
          if ($('#toolkit-popup-calc-button').length) {
            $('#toolkit-popup-calc-button').addClass('toolkit-popup-calc-button-hide');
            $('#toolkit-popup-calc-button').prop('disabled', true);

            ynabToolKit.accountPopupCalculator.$calcBtn.detach();
          }
        }
      }

      function setValue(field, val) {
        let $field = field;

        $field.val(val);
        // eslint-disable-next-line new-cap
        $field.trigger(jQuery.Event('keyup', {
          which: 13
        })); // YNAB will see this and think we updated the field directly

        $field.focus();
      }

      function getValue(field) {
        let $field = field;

        return $field.val();
      }

      return {
        $calcBtn: $('<button>', { id: 'toolkit-popup-calc-button', class: 'ember-view button button-primary' })
                .append($('<i>', { class: 'ember-view flaticon stroke calculator' }))
                .click(function () {
                  ynabToolKit.popupCalculator.setButtonRight(parseFloat($('.ynab-grid-actions').position().left) * -1);
                  ynabToolKit.popupCalculator.showCalculator(true);
                }),
        invoke: function invoke() {
          // ynabToolKit.popupCalculator.accountScreen = true;

          if ($('div.ynab-grid-actions').length) {
            // Add the focus event high enough up the DOM to catch new input fields that are added
            // when a new split is added to a split transaction.
            $('.ynab-grid').on('focus.toolkitPopupCalc', '.is-editing input', focusHandler);
            // head > link:nth-child(41)
            // /html/head/link[12]
            // <link rel="stylesheet" type="text/css" href="chrome-extension://fjhilbmiphodljkihbakkgfiedakgldb/res/features/popup-calculator/account/main.css">
            $('link[rel="stylesheet"][href$="/res/features/popup-calculator/account/main.css"]').prop('disabled', false);
            $('link[rel="stylesheet"][href$="/res/features/popup-calculator/budget/main.css"]').prop('disabled', true);
          }
        },

        observe: function observe(changedNodes) {
          if (changedNodes.has('accounts-toolbar-edit-transaction ember-view button') ||
              changedNodes.has('ynab-grid-add-rows')) {
            ynabToolKit.accountPopupCalculator.invoke();
          }
        }
      };
    }());

    ynabToolKit.accountPopupCalculator.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
