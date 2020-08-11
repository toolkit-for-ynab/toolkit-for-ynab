/* eslint-disable no-nested-ternary, one-var-declaration-per-line, one-var */

ynabToolKit.shared = (function() {
  return {
    parseSelectedMonth() {
      // TODO: There's probably a better way to reference this view, but this works better than DOM scraping which seems to fail in Firefox
      if ($('.ember-view .budget-header').length) {
        var headerView = this.getEmberView($('.ember-view .budget-header').attr('id'));
        var selectedMonthUTC = headerView.get('currentMonth').toNativeDate();
        return new Date(selectedMonthUTC.getUTCFullYear(), selectedMonthUTC.getUTCMonth(), 1);
      }

      return null;
    },

    getEmberView(viewId) {
      const registry = this.getEmberViewRegistry();
      return registry[viewId];
    },

    getEmberViewRegistry() {
      return __ynabapp__.__container__.lookup('-view-registry:main');
    },

    monthsShort: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],

    monthsFull: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  };
})(); // Keep feature functions contained within this object

// This poll() function will only need to run until we find that the DOM is ready
// For certain functions, we may run them once automatically on page load before 'changes' occur
(function poll() {
  function isYNABReady() {
    return (
      typeof Ember !== 'undefined' &&
      typeof $ !== 'undefined' &&
      !$('.ember-view.is-loading').length &&
      typeof ynabToolKit !== 'undefined' &&
      typeof YNABFEATURES !== 'undefined'
    );
  }

  if (isYNABReady()) {
    ynabToolKit.pageReady = true;
  } else if (typeof Ember !== 'undefined') {
    Ember.run.next(poll, 250);
  } else {
    setTimeout(poll, 250);
  }
})();
