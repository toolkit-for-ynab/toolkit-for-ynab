function injectInitializer() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined') {

    (function($){
      
    if ($(".undo-redo-container").length){
      var toggleButton = "<button id=\"toggleSplits\" class=\"ember-view button\"><i class=\"ember-view flaticon stroke down\"></i><i class=\"ember-view flaticon stroke right\"></i> Toggle Splits </button>"
      $(toggleButton).insertAfter(".accounts-toolbar .undo-redo-container");
      
      // default the right arrow to hidden
      $("#toggleSplits > .right").hide();
      
      $("#toggleSplits").bind("click", function() { 
        $(".ynab-grid-body-sub").toggle();
        $("#toggleSplits > i").toggle(); 
      });
    }      
    else{
      setTimeout(injectInitializer, 250);
    }

    })(jQuery)
  } else {
    setTimeout(injectInitializer, 250);
  }
}

setTimeout(injectInitializer, 250);
