(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.spendingByCategory = (function () {
      return {
        reportHeaders() {

        },

        calculate() {

        },

        createChart() {

        },

        updateReportWithDataFilter() {

        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
