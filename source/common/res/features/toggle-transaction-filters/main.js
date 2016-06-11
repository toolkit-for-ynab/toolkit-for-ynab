(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {

    ynabToolKit.toggleTransactionFilters = (function () {

      function toggleReconciled() {
        var container = ynabToolKit.shared.containerLookup('controller:accounts');
        var settingReconciled = !container.filters.get('reconciled');
        container.filters.get('propertiesToSet').setProperties({ reconciled: settingReconciled });
        container.filters.applyFilters();

        if (settingReconciled) {
          $('#toolkit-toggleReconciled').removeClass('toolkit-button-toggle-hidden').addClass('toolkit-button-toggle-visible');
        } else {
          $('#toolkit-toggleReconciled').addClass('toolkit-button-toggle-hidden').removeClass('toolkit-button-toggle-visible');
        }
      }

      function toggleScheduled() {
        var container = ynabToolKit.shared.containerLookup('controller:accounts');
        var settingScheduled = !container.filters.get('scheduled');
        container.filters.get('propertiesToSet').setProperties({ scheduled: settingScheduled });
        container.filters.applyFilters();

        if (settingScheduled) {
          $('#toolkit-toggleScheduled').removeClass('toolkit-button-toggle-hidden').addClass('toolkit-button-toggle-visible');
        } else {
          $('#toolkit-toggleScheduled').addClass('toolkit-button-toggle-hidden').removeClass('toolkit-button-toggle-visible');
        }
      }

      function updateToggleButtons(settingReconciled, settingScheduled) {
        // set button classes
        if (settingReconciled) {
          $('#toolkit-toggleReconciled').removeClass('toolkit-button-toggle-hidden').addClass('toolkit-button-toggle-visible');
        } else {
          $('#toolkit-toggleReconciled').addClass('toolkit-button-toggle-hidden').removeClass('toolkit-button-toggle-visible');
        }

        if (settingScheduled) {
          $('#toolkit-toggleScheduled').removeClass('toolkit-button-toggle-hidden').addClass('toolkit-button-toggle-visible');
        } else {
          $('#toolkit-toggleScheduled').addClass('toolkit-button-toggle-hidden').removeClass('toolkit-button-toggle-visible');
        }
      }

      function initToggleButtons() {
        // get internal filters
        var container = ynabToolKit.shared.containerLookup('controller:accounts');
        var settingReconciled = container.filters.get('reconciled');
        var settingScheduled = container.filters.get('scheduled');

        // insert or edit buttons
        if (!$('#toolkit-toggleReconciled').length) {
          // create buttons if they don't already exist
          if (ynabToolKit.options.toggleTransactionFilters == '2') {
            // show both text and icons
            $('.accounts-toolbar .accounts-toolbar-right').append('<button id="toolkit-toggleReconciled" class="button" title="Toggle Reconciled Transactions"><i class="flaticon solid lock-1 is-reconciled"></i> Reconciled</button>');
            $('.accounts-toolbar .accounts-toolbar-right').append('<button id="toolkit-toggleScheduled" class="button" title="Toggle Scheduled Transactions"><i class="flaticon solid clock-1 is-reconciled"></i> Scheduled</button>');
          } else {
            // show only icons
            $('.accounts-toolbar .accounts-toolbar-right').append('<button id="toolkit-toggleReconciled" class="button button-icononly" title="Toggle Reconciled Transactions"><i class="flaticon solid lock-1 is-reconciled"></i></button>');
            $('.accounts-toolbar .accounts-toolbar-right').append('<button id="toolkit-toggleScheduled" class="button button-icononly" title="Toggle Scheduled Transactions"><i class="flaticon solid clock-1 is-reconciled"></i></button>');
          }

          updateToggleButtons(settingReconciled, settingScheduled);
        } else {
          // if buttons exist, double check visibility classes
          updateToggleButtons(settingReconciled, settingScheduled);
        }
      }

      return {
        invoke: function () {
          // invoke on load
          if (/accounts/.test(window.location.href)) {
            // create buttons
            initToggleButtons();
          }

          // add functionality on click
          $('body').on('click', 'button#toolkit-toggleReconciled', toggleReconciled);
          $('body').on('click', 'button#toolkit-toggleScheduled', toggleScheduled);
        },

        observe: function (changedNodes) {
          // activate button styles if filters potentially change
          // activate if switch to individual account, or all accounts views
          if (
            changedNodes.has('modal-overlay pure-u modal-generic modal-account-filters active closing') ||
            changedNodes.has('ynab-grid-body')) {
            initToggleButtons();
          }
        },
      };
    })(); // Keep feature functions contained within this

    ynabToolKit.toggleTransactionFilters.invoke();
  } else {
    setTimeout(poll, 250);
  }
})();
