(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (
    typeof ynabToolKit !== 'undefined' &&
    ynabToolKit.pageReady === true &&
    typeof Ember !== 'undefined'
  ) {
    ynabToolKit.l10n = (function() {
      // Supporting functions,
      // or variables, etc

      // Shortcuts
      var l10n = ynabToolKit.l10nData;
      ynabToolKit.l10nMissingStrings = {};

      ynabToolKit.shared.monthsShort = ynabToolKit.shared.monthsShort.map(function(month) {
        return l10n['months.' + month];
      });

      ynabToolKit.shared.monthsFull = ynabToolKit.shared.monthsFull.map(function(month) {
        return l10n['months.' + month];
      });

      function getDateInfo() {
        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        var currentMonthName = ynabToolKit.shared.monthsShort[selectedMonth.getMonth()];
        var previousMonthName;
        if (selectedMonth.getMonth() === 0) {
          previousMonthName = ynabToolKit.shared.monthsShort[11];
        } else {
          previousMonthName = ynabToolKit.shared.monthsShort[selectedMonth.getMonth() - 1];
        }

        return {
          selectedMonth,
          currentMonthName,
          previousMonthName,
        };
      }

      // Tool for setting content.
      var contentSetter = (function() {
        return {
          selectorPrefix: '',
          resetPrefix() {
            contentSetter.selectorPrefix = '';
          },

          // Takes contentNum's .contents() of selector and sets it to text.
          set(text, contentNum, selector) {
            var el = $(contentSetter.selectorPrefix + (selector || '')).contents()[contentNum];
            if (el) el.textContent = text;
          },

          // Each argument must be an array of 2 or 3 elements that become set arguments in order.
          setSeveral() {
            for (var i = 0; i < arguments.length; i++) {
              if (arguments[i].length === 2) contentSetter.set(arguments[i][0], arguments[i][1]);
              if (arguments[i].length === 3)
                contentSetter.set(arguments[i][0], arguments[i][1], arguments[i][2]);
            }
          },

          setArray(textArray, selector, start, step) {
            for (var j = 0; j < textArray.length; j++) {
              var contentNum = (start || 0) + j * (step || 1);
              contentSetter.set(textArray[j], contentNum, selector);
            }
          },
        };
      })();

      return {
        invoke() {
          if ($.isEmptyObject(ynabToolKit.l10nMissingStrings)) {
            ynabToolKit.l10nEmberData = Ember.I18n.translations;
            var toolkitStrings = new Set(Object.keys(ynabToolKit.l10nData));
            var emberStrings = new Set(Object.keys(ynabToolKit.l10nEmberData));
            emberStrings.forEach(function(s) {
              if (!toolkitStrings.has(s)) {
                ynabToolKit.l10nMissingStrings[s] = ynabToolKit.l10nEmberData[s];
              }
            });
          }

          Ember.I18n.translations = jQuery.extend(
            true,
            Ember.I18n.translations,
            ynabToolKit.l10nData
          );
        },

        budgetHeader() {
          if (!$('.navlink-budget').hasClass('active')) return;
          var dateInfo = getDateInfo();
          contentSetter.selectorPrefix = '.budget-header-';
          var dateYearText = dateInfo.currentMonthName + ' ' + dateInfo.selectedMonth.getFullYear();
          contentSetter.set(dateYearText, 1, 'calendar-date-button');

          contentSetter.selectorPrefix = '.budget-header-totals-cell-name';
          contentSetter.setArray([
            l10n['budget.fundsFor'].replace('{{currentMonth}}', dateInfo.currentMonthName),
            l10n['budget.overspentIn'].replace('{{previousMonth}}', dateInfo.previousMonthName),
            l10n['budget.fundedIn'].replace('{{currentMonth}}', dateInfo.currentMonthName),
          ]);
        },

        observe(changedNodes) {
          ynabToolKit.l10n.invoke();

          // User has returned back to the budget screen
          // User switch budget month
          if (changedNodes.has('budget-header-flexbox') || changedNodes.has('budget-table')) {
            ynabToolKit.l10n.budgetHeader();
          }

          if (
            changedNodes.has('budget-inspector') ||
            changedNodes.has('is-checked') ||
            changedNodes.has('budget-inspector-goals')
          ) {
            // Inspector edit goal months list.
            contentSetter.resetPrefix();
            contentSetter.setArray(
              ynabToolKit.shared.monthsFull,
              '.budget-inspector-goals .goal-target-month>option',
              1,
              3
            );
          }

          // Hidden categories modal
          if (changedNodes.has('modal-overlay ynab-u modal-budget-hidden-categories active')) {
            contentSetter.selectorPrefix =
              '.modal-budget-hidden-categories-master-unhidden:contains("Credit Card Payments")';
            contentSetter.set(l10n['toolkit.creditCardPayments'], 1);
          }

          // User prefs modal
          if (changedNodes.has('modal-overlay ynab-u modal-popup modal-user-prefs active')) {
            contentSetter.selectorPrefix = '.modal-user-prefs button';
            contentSetter.set(l10n['toolkit.myAccount'], 1);
          }

          // New transaction fields modals
          if (changedNodes.has('modal-overlay ynab-u modal-popup modal-account-flags active')) {
            contentSetter.selectorPrefix = '.modal-account-flags';
            var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'].map(function(
              color
            ) {
              return l10n['toolkit.' + color];
            });

            contentSetter.setArray(colors, ' .label');
            contentSetter.setArray(colors, ' .label-bg');
          }

          if (
            changedNodes.has(
              'modal-overlay ynab-u modal-popup modal-account-dropdown modal-account-categories active'
            )
          ) {
            contentSetter.selectorPrefix = '.modal-account-categories ';
            contentSetter.setSeveral(
              [l10n['toolkit.inflow'], 0, '.modal-account-categories-section-item'],
              [l10n['budget.leftToBudget'], 1, '.modal-account-categories-category-name']
            );
          }

          if (
            changedNodes.has(
              'modal-overlay ynab-u modal-popup modal-account-dropdown modal-account-payees active'
            )
          ) {
            contentSetter.selectorPrefix = '.modal-account-payees .is-section-item';
            contentSetter.setArray([l10n['toolkit.transfer'], l10n['toolkit.memorized']], '', 1, 3);
          }

          if (
            changedNodes.has('modal-overlay ynab-u modal-account-calendar active') ||
            changedNodes.has('accounts-calendar')
          ) {
            contentSetter.selectorPrefix = '.modal-account-calendar';
            var days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(function(day) {
              return l10n['toolkit.dayOfWeek' + day];
            });

            contentSetter.setArray(days, ' .accounts-calendar-weekdays li');
            contentSetter.selectorPrefix =
              '.modal-account-calendar .accounts-calendar-selected-date';
            var dateText = $(contentSetter.selectorPrefix).contents()[1].textContent;
            var year = dateText.split(' ')[1];
            var month = l10n['months.' + dateText.split(' ')[0]];
            contentSetter.set(month + ' ' + year, 1);
          }

          // Accounts filters months options
          if (changedNodes.has('modal-overlay ynab-u modal-generic modal-account-filters active')) {
            contentSetter.selectorPrefix = '.modal-account-filters ';
            contentSetter.setArray(ynabToolKit.shared.monthsFull, '.date-range-from-months option');
            contentSetter.setArray(ynabToolKit.shared.monthsFull, '.date-range-to-months option');
          }

          // Account row
          if (changedNodes.has('ynab-grid-body')) {
            $('.ynab-grid-cell-payeeName[title="Starting Balance"]')
              .contents()
              .each(function() {
                if (this.textContent === 'Starting Balance')
                  this.textContent = l10n['toolkit.startingBalance'];
              });

            $('.ynab-grid-cell-subCategoryName[title="Inflow: To be Budgeted"]')
              .contents()
              .each(function() {
                if (this.textContent === 'Inflow: To be Budgeted')
                  this.textContent = l10n['toolkit.inflowTBB'];
              });

            $('.ynab-grid-cell-subCategoryName[title="Split (Multiple Categories)..."]')
              .contents()
              .each(function() {
                if (this.textContent === 'Split (Multiple Categories)...')
                  this.textContent = l10n['toolkit.splitMultipleCategories'];
              });
          }
        },
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.l10n.invoke(); // Run your script once on page load
    ynabToolKit.l10n.budgetHeader();

    // Rerender sidebar and content views on page load.
    var rerenderClasses = ['.layout'];
    for (var i = 0; i < rerenderClasses.length; i++) {
      ynabToolKit.shared.getEmberView($(rerenderClasses[i]).attr('id')).rerender();
    }

    // When rerendering sidebar accounts lists are closing, open them.
    // $('.nav-account-block').click();
  } else if (typeof Ember !== 'undefined') {
    Ember.run.next(poll, 250);
  } else {
    setTimeout(poll, 250);
  }
})();
