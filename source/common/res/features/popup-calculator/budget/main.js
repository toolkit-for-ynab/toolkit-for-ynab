(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.budgetPopupCalculator = (function () {
      function clickCalcHandler(event, $who) {
        let who = $who.attr('id').substring(26);
        let ele = '#toolkit-popup-calc-' + who;

        $('#ember' + who).addClass('toolkit-popup-calc-overflow');

        event.stopPropagation();
        ynabToolKit.popupCalculator.setEntryField($who.closest('ul').find('li.budget-table-cell-budgeted > div.currency-input').attr('id'));
        ynabToolKit.popupCalculator.setPopupButton($who.attr('id'));
        ynabToolKit.popupCalculator.setButtonRight(ynabToolKit.budgetPopupCalculator.buttonRight);
        ynabToolKit.popupCalculator.setButtonBottom(ynabToolKit.budgetPopupCalculator.buttonBottom);
        ynabToolKit.popupCalculator.setAppendToElement(ele);
        ynabToolKit.popupCalculator.setSetValueCallback(setValue);
        ynabToolKit.popupCalculator.setGetValueCallback(getValue);
        ynabToolKit.popupCalculator.setDeleteOnDismiss(true);
        ynabToolKit.popupCalculator.showCalculator(false);
      }

      function clickSubCatCheckBox() {
        if ($(this).hasClass('is-checked')) {
          $(this) // hide the calculator button on my sibling
            .closest('li')
            .siblings('li.toolkit-popup-calc-button')
            .addClass('toolkit-popup-calc-button-hide')
            .removeClass('toolkit-popup-calc-button-show');
        } else {
          $(this) // show the calculator button on my sibling
            .closest('li')
            .siblings('li.toolkit-popup-calc-button')
            .addClass('toolkit-popup-calc-button-show')
            .removeClass('toolkit-popup-calc-button-hide');
        }
      }

      function clickSubCatHandler() {
        let subCat = '#' + $(this).attr('id');
        // If the ID for the current ID is not the same as the last ID, rearrange the class names needed to hide/show the calculator icon.
        if (subCat !== ynabToolKit.budgetPopupCalculator.lastSubCat) {
          ynabToolKit.budgetPopupCalculator.lastSubCat = subCat;

          $(this) // hide the calculator button on my siblings
            .siblings()
            .children('li.toolkit-popup-calc-button')
            .addClass('toolkit-popup-calc-button-hide')
            .removeClass('toolkit-popup-calc-button-show');
          $(this) // show the calculator button for me
            .children('.toolkit-popup-calc-button')
            .addClass('toolkit-popup-calc-button-show')
            .removeClass('toolkit-popup-calc-button-hide');
        }
      }

      function clickMstrCatHandler() {
        $('div.budget-table > ul > li.toolkit-popup-calc-button.toolkit-popup-calc-button-show')
          .addClass('toolkit-popup-calc-button-hide')
          .removeClass('toolkit-popup-calc-button-show');

        ynabToolKit.budgetPopupCalculator.lastSubCat = '';
      }

      function setValue(field, val) {
        let input = $('#' + field).click().find('input');

        $(input).val(val);

        if (!ynabToolKit.options.warnOnQuickBudget) {
          // only seems to work if the confirmation doesn't pop up?
          // haven't figured out a way to properly blur otherwise
          input.blur();
        }
      }

      function getValue(field) {
        let input = $('#' + field).click().find('input');
        let val = $(input).val();

        if (!ynabToolKit.options.warnOnQuickBudget) {
          // only seems to work if the confirmation doesn't pop up?
          // haven't figured out a way to properly blur otherwise
          input.blur();
        }

        return val;
      }

      return {
        lastSubCat: '',
        $mstCatLI: $('<li>', { class: 'toolkit-popup-calc-mstcat-col', style: 'width: 1.75% !important' }),
        buttonBottom: -247,
        buttonRight: 22,
        invoke: function invoke() {
          if (!$('.budget-table-header > li.budget-table-cell-calc').length) {
            $('.budget-table-header .budget-table-cell-budgeted').after('<li class="budget-table-cell-calc" style="width: 1.75% !important">&nbsp;</li>');
          }

          if ($('div.budget-table').length && !$('.budget-table-row > li.toolkit-popup-calc-button').length) {
            $('link[rel="stylesheet"][href$="/res/features/popup-calculator/budget/main.css"]').prop('disabled', false);
            $('link[rel="stylesheet"][href$="/res/features/popup-calculator/account/main.css"]').prop('disabled', true);

            $('div.budget-table').on('click.toolkitPopupCalcSubCatChk', '.budget-table-row.is-sub-category > li > div > button.ynab-checkbox-button', clickSubCatCheckBox);
            $('div.budget-table').on('click.toolkitPopupCalcSubCat', 'ul.budget-table-row.is-sub-category', clickSubCatHandler);
            $('div.budget-table').on('click.toolkitPopupCalcMstCat', '.budget-table-row.is-master-category', clickMstrCatHandler);
            $('div.budget-header').on('click.toolkitPopupCalcGblCat', 'li > div.ynab-checkbox', clickMstrCatHandler);

            ynabToolKit.budgetPopupCalculator.$mstCatLI.insertAfter($('.budget-table-row.is-master-category > li.budget-table-cell-budgeted'));
            ynabToolKit.budgetPopupCalculator.$mstCatLI.insertAfter($('.budget-table-row.budget-table-uncategorized-transactions > li.budget-table-cell-budgeted'));

            $('.budget-table-row').each(function () {
              if ($(this).hasClass('is-master-category') || $(this).hasClass('budget-table-uncategorized-transactions')) {
                return;
              }

              let id = $(this).attr('id').substring(5); // The elements we add below will use the numeric portion of the ember generated id.

              $('#' + $(this).attr('id') + ' > li.budget-table-cell-budgeted')
                .after($('<li>', { class: 'toolkit-popup-calc-button toolkit-popup-calc-button-hide' })
                  .append($('<button>', { id: 'toolkit-popup-calc-button-' + id, class: 'ember-view button button-primary toolkit-button-primary' })
                    .append($('<i>', { class: 'ember-view flaticon stroke calculator' }))
                      .click(function (event) {
                        clickCalcHandler(event, $(this));
                      }))
                  .append($('<div>', { id: 'toolkit-popup-calc-' + id, class: 'toolkit-popup-calc-postition' })));
            });

            switch (ynabToolKit.options.budgetRowsHeight) {
              case '0':
                ynabToolKit.budgetPopupCalculator.buttonBottom = -247;
                ynabToolKit.budgetPopupCalculator.buttonRight = 20;
                break;
              case '1':
                ynabToolKit.budgetPopupCalculator.buttonBottom = -244;
                ynabToolKit.budgetPopupCalculator.buttonRight = 18;
                break;
              case '2':
                ynabToolKit.budgetPopupCalculator.buttonBottom = -242;
                ynabToolKit.budgetPopupCalculator.buttonRight = 16;
                break;
              case '3':
                ynabToolKit.budgetPopupCalculator.buttonBottom = -217;
                ynabToolKit.budgetPopupCalculator.buttonRight = 16;
                break;
            }
          }
        },

        observe: function observe(changedNodes) {
          if (changedNodes.has('budget-content  resizable') ||
              changedNodes.has('budget-table-header') ||
              changedNodes.has('inspector-quick-budget')) {
            ynabToolKit.budgetPopupCalculator.invoke();
          }
        }
      };
    }());

    ynabToolKit.budgetPopupCalculator.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
