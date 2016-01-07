(function ynab_enhanced_toggle_splits() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined' && typeof $ !== 'undefined') {

    if ($(".undo-redo-container").length && !$('#toggleSplits').length) {
      var toggleButton = "<button id=\"toggleSplits\" class=\"ember-view button\"><i class=\"ember-view flaticon stroke down\"></i><i class=\"ember-view flaticon stroke right\"></i> Toggle Splits </button>"
      $(toggleButton).insertAfter(".accounts-toolbar .undo-redo-container");

      // default the right arrow to hidden
      $("#toggleSplits > .right").hide();

      $("#toggleSplits").bind("click", function() {
        $(".ynab-grid-body-sub").toggle();
        $("#toggleSplits > i").toggle();
      });
    }
  }

  setTimeout(ynab_enhanced_toggle_splits, 250);
})()
