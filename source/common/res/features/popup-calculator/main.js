(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.popupCalculator = (function () {
      let popupCalc = new Calculator();
      let $field = '';
      let btnRight = 0;
      let btnBottom = -242;
      let afterElement = '';
      let appendElement = '';
      let deleteOnDismiss = false;
      let origValue = '';
      let popupButton = 'toolkit-popup-calc-button';
      let calcValue = 0;
      let setValueCallback = '';
      let getValueCallback = '';
      let decimalDigits = ynab.YNABSharedLib.currencyFormatter.getCurrency().decimal_digits;
      let decimalSeparator = ynab.YNABSharedLib.currencyFormatter.getCurrency().decimal_separator;
      let separatorCode = decimalSeparator === '.' ? 190 : 188;

      return {
        setDeleteOnDismiss(val) {
          deleteOnDismiss = val;

          return;
        },

        setInsertAfterElement(val) {
          afterElement = val;
          appendElement = '';

          return;
        },

        setAppendToElement(val) {
          appendElement = val;
          afterElement = '';

          return;
        },

        setButtonRight(val) {
          btnRight = val;

          return;
        },

        setButtonBottom(val) {
          btnBottom = val;

          return;
        },

        setPopupButton(val) {
          popupButton = val;

          return;
        },

        setEntryField(val) {
          $field = val;

          return;
        },

        getEntryField() {
          return $field;
        },

        setSetValueCallback(callback) {
          setValueCallback = callback;
        },

        setGetValueCallback(callback) {
          getValueCallback = callback;
        },

        showCalculator(budgetScreen) {
          $('#' + popupButton).prop('disabled', true);

          popupCalc.reset();

          origValue = getValueCallback($field);

          if (origValue === '') {
            origValue = '0' + decimalSeparator + '0'.repeat(decimalDigits);
          }

          popupCalc.value(origValue);

          if ($('#toolkitPopupCalc').length) {
            $('#toolkitPopupCalcInput').val(origValue);
            $('#toolkitPopupCalc').removeClass('toolkit-popup-calc-hide');
          } else {
            let actionsClass = (budgetScreen) ? 'ynab-grid-actions' : 'toolkit-calc-actions';
            let $calc = $('<div>', { id: 'toolkitPopupCalc', class: 'ember-view ' + actionsClass, style: 'right: ' + btnRight + 'px; bottom: ' + btnBottom + 'px;' })
              .append($('<input>', { id: 'toolkitPopupCalcInput', readonly: 'readonly', class: 'ember-view ember-text-field' })
                .val(origValue))
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
                  .append($('<button>', { id: 'toolkitBtnD', class: 'ember-view button button-primary toolkit-popup-calc-button1 toolkit-popup-calc-btncol4' })
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
                  .append($('<button>', { id: 'toolkitBtnM', class: 'ember-view button button-primary toolkit-popup-calc-button1 toolkit-popup-calc-btncol4' })
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
                  .append($('<button>', { id: 'toolkitBtnS', class: 'ember-view button button-primary toolkit-popup-calc-button1 toolkit-popup-calc-btncol4' })
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
                  .append($('<button>', { id: 'toolkitBtnA', class: 'ember-view button button-primary toolkit-popup-calc-button1 toolkit-popup-calc-btncol4' })
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
                  .append(decimalSeparator)
                  .click(() => {
                    doCalculation(decimalSeparator);
                  })))
                .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                  .append($('<button>', { id: 'toolkitBtnE', class: 'ember-view button button-primary toolkit-popup-calc-button1' })
                  .append('=')
                  .click(() => {
                    doCalculation('=');
                  })))
                .append($('<li>', { class: 'toolkit-popup-calc-btnrow' })
                  .append($('<button>', { id: 'toolkitBtn%', class: 'ember-view button button-primary toolkit-popup-calc-button1 toolkit-popup-calc-btncol4' })
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
                }));

            if (afterElement !== '') {
              $calc.insertAfter(afterElement);
            } else {
              $calc.appendTo(appendElement);
            }
          }

          $(document).on('keyup.toolkitPopupCalc', (e) => {
            if (e.which === 27) { // ESC key?
              dismissCalculator();
            } else if ((e.which > 45 && e.which < 58) ||  // keyboard
                       (e.which > 95 && e.which < 112) || // numpad
                        e.which === separatorCode ||      // keyboard period (190) or comma (188) or ???
                        e.which === 187 ||                // keyboard plus (shift key plus equal key)
                        e.which === 189 ||                // keyboard minus
                        e.which === 191 ||                // keyboard forward slash (divide)
                        e.which === 8 ||                  // backspace
                        e.which === 67 ||                 // c (clear)
                        e.which === 13) {                 // numpad enter
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
            if (deleteOnDismiss) {
              $('#toolkitPopupCalc').remove();
            } else {
              $('#toolkitPopupCalc').addClass('toolkit-popup-calc-hide');
            }

            $('#' + popupButton).removeClass('toolkit-popup-calc-button-hide');
            $('#' + popupButton).prop('disabled', false);

            $(document).off('click.toolkitPopupCalc');
            $(document).off('keyup.toolkitPopupCalc');

            calcValue = '';
          }
        }
      };

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

            if (key === decimalSeparator) {
              if (value2.toString().includes(decimalSeparator)) {
                key = '';
              }

              if (value2 === '') {
                value2 = '0'; // results in displaying a leading 0 for fractional values
              }
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
              if (decimalSeparator !== '.') {
                value1 = ynab.unformat(value1);
                value2 = ynab.unformat(value2);
              }

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
            value1 = ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat(key);
            result = value1;
          },
          display: function () {
            return reveal;
          },
          format: function () {
            return format;
          },
          backspace: function () {
            if (value1.length > 0) {
              value1 = value1.slice(0, value1.length - 1);
            }
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
            calcValue = '';
          }
        };
      }

      function doCalculation(calcVerb) {
        switch (calcVerb) {
          case 'Enter' : // keypad <enter>
          case 'OK' :    // button OK
            calcValue = popupCalc.eval();

            setValueCallback($field, ynab.YNABSharedLib.currencyFormatter.format(ynab.YNABSharedLib.currencyFormatter.convertToMilliDollars(calcValue)));
            break;
          case 'Delete' :    // button <-
          case 'Backspace' : // keyboard <-
            calcValue = popupCalc.backspace();

            break;
          case 'C' : // button C
          case 'c' : // keyboard c
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

        event.stopPropagation();
      }
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
