(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.calendarFirstDay = (function () {
      // Variables for tracking specific states
      var isCalendarOpen = false;
      var isReRendering = false;

      function reRenderHeader() {
        let shiftDays = ynabToolKit.calendarFirstDay.shiftDays();
        // Shift the header items by number of days (only needs to happen once)
        for (var i = 0; i < shiftDays; i++) {
          let first = $('.accounts-calendar-weekdays').children().first();
          let last = $('.accounts-calendar-weekdays').children().last();
          first.insertAfter(last);
        }
        reRenderWeekdays();
      }

      function reRenderWeekdays() {
        let shiftDays = ynabToolKit.calendarFirstDay.shiftDays();

        // Remove all previously added shift elements
        $('.accounts-calendar-grid').find('.shift').remove();

        if ($('.accounts-calendar-empty').length >= shiftDays) {
          // Remove specific # of empty elements
          $('.accounts-calendar-empty').slice(-shiftDays).remove();
        } else {
          // Add 'shift' empty elements
          for (var j = 0; j < (7 - shiftDays); j++) {
            $('.accounts-calendar-grid').prepend('<li class="accounts-calendar-empty shift">&nbsp;</li>');
          }
        }
      }

      return {
        shiftDays() {
          return Number(ynabToolKit.options.calendarFirstDay);
        },
        observe(changedNodes) {
          if (changedNodes.has('ynab-u modal-account-calendar ember-view modal-overlay active')) {
            isCalendarOpen = true;
            reRenderHeader();
          } else if (changedNodes.has('ynab-u modal-account-calendar ember-view modal-overlay active closing')) {
            isCalendarOpen = false;
          } else if (changedNodes.has('accounts-calendar-grid') && !changedNodes.has('accounts-calendar-weekdays') && isCalendarOpen && !isReRendering) {
            isReRendering = true;
            reRenderWeekdays();
          } else if (isReRendering) {
            // It's now safe to start listening for changes on the calendar node
            isReRendering = false;
          }
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
