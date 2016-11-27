(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.popupCalculator = (function () {
      let popupCalc = new Calculator();
      let $field = '';

      function showCalculator() {
        $('#toolkit-popup-calc-button').prop('disabled', true);

        popupCalc.reset();

        $field = ynabToolKit.popupCalculator.$field;

        let calcValue = $field.val();

        if (calcValue === '') {
          calcValue = '0.00';
        }

        popupCalc.value(calcValue);

        if ($('#toolkitPopupCalc').length) {
          $('#toolkitPopupCalcInput').val(calcValue);
          $('#toolkitPopupCalc').removeClass('toolkit-popup-calc-hide');
          $('#toolkit-popup-calc-button').addClass('toolkit-popup-calc-button-hide');
        } else {
          let btnRight = parseFloat($('.ynab-grid-actions').position().left) * -1;

          $('<div>', { id: 'toolkitPopupCalc', class: 'ember-view ynab-grid-actions', style: 'right: ' + btnRight + 'px; bottom: -242px;' })
            .append($('<input>', { id: 'toolkitPopupCalcInput', readonly: 'readonly', class: 'ember-view ember-text-field' })
              .val(calcValue))
            .append($('<ul>', { class: 'toolkit-popup-calc-btnrow' })
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnC', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('C')
                .click(() => {
                  doCalculation('C');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnN', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('+/-')
                .click(() => {
                  doCalculation('N');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnB', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('<-')
                .click(() => {
                  doCalculation('Delete');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnD', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('/')
                .click(() => {
                  doCalculation('/');
                }))))
            .append($('<ul>', { class: 'toolkit-popup-calc-btnrow' })
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn7', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('7')
                .click(() => {
                  doCalculation('7');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn8', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('8')
                .click(() => {
                  doCalculation('8');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn9', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('9')
                .click(() => {
                  doCalculation('9');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnM', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('X')
                .click(() => {
                  doCalculation('*');
                }))))
            .append($('<ul>', { class: 'toolkit-popup-calc-btnrow' })
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn4', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('4')
                .click(() => {
                  doCalculation('4');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn5', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('5')
                .click(() => {
                  doCalculation('5');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn6', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('6')
                .click(() => {
                  doCalculation('6');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnS', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('-')
                .click(() => {
                  doCalculation('-');
                }))))
            .append($('<ul>', { class: 'toolkit-popup-calc-btnrow' })
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn1', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('1')
                .click(() => {
                  doCalculation('1');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn2', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('2')
                .click(() => {
                  doCalculation('2');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn3', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('3')
                .click(() => {
                  doCalculation('3');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnA', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('+')
                .click(() => {
                  doCalculation('+');
                }))))
            .append($('<ul>', { class: 'toolkit-popup-calc-btnrow' })
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn0', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('0')
                .click(() => {
                  doCalculation('0');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnP', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('.')
                .click(() => {
                  doCalculation('.');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtnE', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('=')
                .click(() => {
                  doCalculation('=');
                })))
              .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                .append($('<button>', { id: 'toolkitBtn%', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                .append('%')
                .click(() => {
                  doCalculation('%');
                }))))
            .append($('<button>', { id: 'toolkitBtnOk', class: 'ember-view button button-primary toolkit-popup-calc-button2' })
              .append('OK')
              .click(() => {
                doCalculation('OK');
                dismissCalculator();
              }))
            .append($('<button>', { id: 'toolkitBtnCan', class: 'ember-view button button-primary toolkit-popup-calc-button2' })
              .append('Cancel')
              .click(() => {
                dismissCalculator();
              }))
            .insertAfter('div.is-editing div.ynab-grid-actions');
        }

        $(document).on('keyup.toolkitPopupCalc', (e) => {
          if (e.which === 27) { // ESC key?
            dismissCalculator();
          } else if ((e.which > 45 && e.which < 58) || // keyboard
                     (e.which > 95 && e.which < 112) || // numpad
                      e.which === 8 ||  // backspace
                      e.which === 13 || // numpad enter
                      e.which === 190 || // numpad enter
                      e.which === 187) { // decimal
            doCalculation(e.key);

            if (e.which === 13 || e.which === 18) { // Enter key?
              dismissCalculator();
            }
          }
        });

        // Handle mouse clicks outside the drop-down modal. Namespace the
        // click event so we can remove our specific instance.
        $(document).on('click.toolkitPopupCalc', (e) => {
          if (e.target.id !== 'toolkitPopupCalc') {
            dismissCalculator();
          }
        });

        function dismissCalculator() {
          $('#toolkitPopupCalc').addClass('toolkit-popup-calc-hide');
          $('#toolkit-popup-calc-button').removeClass('toolkit-popup-calc-button-hide');
          $('#toolkit-popup-calc-button').prop('disabled', false);

          $(document).off('click.toolkitPopupCalc');
          $(document).off('keyup.toolkitPopupCalc');
        }
      }

      function Calculator() {
        let oper = '';
        let result = '';
        let reveal = false;
        let format = false;
        let value1 = '';
        let value2 = '';

        return {
          input: function (key) {
            reveal = true;
            format = false;

            if (result === '0' || result === ynab.YNABSharedLib.currencyFormatter.format(ynab.YNABSharedLib.currencyFormatter.convertToMilliDollars(result))) {
              result = '';
            }

            if (result.indexOf('.') !== -1 && key === '.') {
              key = '';
            }

            result = value2 + key + ''; // ensure concatenation
            value2 = result;  // set potential second value
            return result;
          },
          eval: function () {
            if (value2 === '') {
              reveal = false;
              format = false;
            } else {
              switch (oper) {
                case '+' :
                  result = parseFloat(value1) + parseFloat(value2);
                  break;
                case '-' :
                  result = parseFloat(value1) - parseFloat(value2);
                  break;
                case '/' :
                  result = parseFloat(value1) / parseFloat(value2);
                  break;
                case '*' :
                  result = parseFloat(value1) * parseFloat(value2);
                  break;
                case '%' :
                  result = parseFloat(value1) * parseFloat('.' + value2);
                  break;
              }

              value1 = result;
              value2 = '';
              oper = '';
              reveal = true;
              format = true;
            }

            return result;
          },
          clear: function () {
            oper = '';
            value1 = '';
            value2 = '';
            result = ynab.YNABSharedLib.currencyFormatter.format(ynab.YNABSharedLib.currencyFormatter.convertToMilliDollars(0));
            reveal = true;
            format = true;

            return result;
          },
          negate: function () {
            oper = '*';
            value2 = '-1';

            return this.eval();
          },
          percent: function () {
            reveal = true;
            format = true;
            value2 = parseFloat(value1) * parseFloat(value2 / 100);

            return value2;
          },
          oper: function (key) {
            if (key === '=') {
              oper = '';
              format = true;
            } else {
              oper = key;
              format = false;
            }
          },
          value: function (key) {
            value1 = key;
            result = key;
          },
          display: function () {
            return reveal;
          },
          format: function () {
            return format;
          },
          backspace: function () {
            value1 = value1.slice(0, value1.length - 1);
            value2 = '';
            result = '';
            format = false;
            reveal = true;
            return value1;
          },
          reset: function () {
            oper = '';
            result = '';
            value1 = '';
            value2 = '';
          }
        };
      }

      function doCalculation(calcVerb) {
        let calcValue;

        switch (calcVerb) {
          case 'Enter' : // keypad <enter>
          case 'OK' :    // button OK
            calcValue = popupCalc.eval();
            $field.val(ynab.YNABSharedLib.currencyFormatter.format(ynab.YNABSharedLib.currencyFormatter.convertToMilliDollars(calcValue)));
            // eslint-disable-next-line new-cap
            $field.trigger(jQuery.Event('keyup', {
              which: 13
            })); // YNAB will see this and think the updated the field directly

            $field.focus();

            break;
          case 'Delete' :    // button <-
          case 'Backspace' : // keyboard <-
            calcValue = popupCalc.backspace();

            break;
          case 'C' : // button C
            calcValue = popupCalc.clear();

            break;
          case 'N' : // button +/-
            calcValue = popupCalc.negate();

            break;
          case '=' : // keyboard =
          case '+' : // keypad/button +
          case '-' : // keypad/button -
          case '/' : // keypad/button /
          case '*' : // keypad/button *
            calcValue = popupCalc.eval(); // evaluate existing expression
            popupCalc.oper(calcVerb);     // set operator for next evaluation

            break;
          case '%' : // keyboard %
            calcValue = popupCalc.percent(); // evaluate existing expression

            break;
          default:
            calcValue = popupCalc.input(calcVerb);
        }

        if (popupCalc.display()) {
          if (popupCalc.format()) {
            $('#toolkitPopupCalcInput').val(ynab.YNABSharedLib.currencyFormatter.format(ynab.YNABSharedLib.currencyFormatter.convertToMilliDollars(calcValue)));
          } else {
            $('#toolkitPopupCalcInput').val(calcValue);
          }
        }
      }

      function focusHandler() {
        if ($(this).prop('placeholder') === 'outflow' || $(this).prop('placeholder') === 'inflow') {
          ynabToolKit.popupCalculator.$field = $('#' + $(this).attr('id'));

          if (!$('#toolkit-popup-calc-button').length) {
            let $grid = '#' + $('div.ynab-grid-actions').attr('id');
            ynabToolKit.popupCalculator.$calcBtn.prependTo($($grid));

            $('#toolkit-popup-calc-button').prop('disabled', false);
            $('#toolkit-popup-calc-button').removeClass('toolkit-popup-calc-button-hide');
          }
        } else {
          if ($('#toolkit-popup-calc-button').length) {
            $('#toolkit-popup-calc-button').addClass('toolkit-popup-calc-button-hide');
            $('#toolkit-popup-calc-button').prop('disabled', true);

            ynabToolKit.popupCalculator.$calcBtn.detach();
          }
        }
      }

      return {
        $field: '',
        $calcBtn: $('<button>', { id: 'toolkit-popup-calc-button', class: 'ember-view button button-primary' })
                .append($('<i>', { class: 'ember-view flaticon stroke calculator' }))
                .click(function () {
                  showCalculator();
                }),
        invoke: function invoke() {
          if ($('div.ynab-grid-actions').length) {
            // Add the focus event high enough up the DOM to catch new input fields that are added
            // when a new split is added to a split transaction.
            $('.ynab-grid').on('focus.toolkitPopupCalc', '.is-editing input', focusHandler);
          }
        },

        observe: function observe(changedNodes) {
          if (changedNodes.has('accounts-toolbar-edit-transaction ember-view button') ||
              changedNodes.has('ynab-grid-add-rows')) {
            ynabToolKit.popupCalculator.invoke();
          }
        }
      };
    }());

    let router = ynabToolKit.shared.containerLookup('router:main');
    if (router.get('currentPath').indexOf('accounts') > -1) {
      ynabToolKit.popupCalculator.invoke();
    }
  } else {
    setTimeout(poll, 250);
  }
}());
