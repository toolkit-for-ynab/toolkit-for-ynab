(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.activityTransactionLink = (function () {
      function initialize() {
        console.log('doin it');
      }

      return {
        invoke() {
          Ember.Instrumentation.subscribe('render.view', {
            before: function () {},
            after: function (event, timestamp, view) {
              console.log('in here', view);
              if (view.containerKey === 'view:modals/budget/activity') {
                initialize();
              }
            }
          });
        }
      };
    }());

    ynabToolKit.activityTransactionLink.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
