/**
 * Use this template to add new js functions to your features
 *
 * To help isolate and protect our functions and variables from
 * the production code, we want to contain all of our optional features
 * within the global ynabToolKit object, which is created on page load.
 *
 * Note: Using this.observe() is optional, but we use a MutationObserver instance
 * to evaluate changes on the page and feed those changes to each function
 * that might want to act on a specific change in the DOM.
 */

(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.calendarFirstDay = (function () {
      // Supporting functions,
      // or variables, etc

      var isCalendarOpen = false;
      var isReRendering = false;

      function reRenderHeader() {
        let shiftDays = ynabToolKit.calendarFirstDay.shiftDays();
        for (var i = 0; i < shiftDays; i++) {
          let first = $('.accounts-calendar-weekdays').children().first();
          let last = $('.accounts-calendar-weekdays').children().last();
          first.insertAfter(last);
        }
        reRenderWeekdays(shiftDays);
      }

      function reRenderWeekdays(shiftDays) {
        // Remove all previously added shift elements
        $('.accounts-calendar-grid').find('.shift').remove();

        if ($('.accounts-calendar-empty').length >= shiftDays) {
          // Remove empty elements
          $('.accounts-calendar-empty').slice(-shiftDays).remove();
        } else {
          // Add 'shift' elements
          for (var j = 0; j < (7 - shiftDays); j++) {
            $('.accounts-calendar-grid').prepend('<li class="accounts-calendar-empty shift">&nbsp;</li>');
          }
        }
      }

      return {
        invoke() {
          // Code you expect to run each time your feature needs to update or modify YNAB's state
        },
        shiftDays() {
          return Number(ynabToolKit.options.calendarFirstDay);
        },
        observe(changedNodes) {
          if (changedNodes.has('ynab-u modal-account-calendar ember-view modal-overlay active')) {
            isCalendarOpen = true;
            if (ynabToolKit.calendarFirstDay.shiftDays() !== 0) {
              reRenderHeader();
            }
          } else if (changedNodes.has('ynab-u modal-account-calendar ember-view modal-overlay active closing')) {
            isCalendarOpen = false;
          } else if (changedNodes.has('accounts-calendar-grid') && !changedNodes.has('accounts-calendar-weekdays') && isCalendarOpen && !isReRendering) {
            isReRendering = true;
            let shiftDays = ynabToolKit.calendarFirstDay.shiftDays();
            if (shiftDays !== 0) {
              reRenderWeekdays(shiftDays);
            }
          } else if (isReRendering) {
            isReRendering = false;
          }
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.calendarFirstDay.invoke(); // Run your script once on page load
  } else {
    setTimeout(poll, 250);
  }
}());
