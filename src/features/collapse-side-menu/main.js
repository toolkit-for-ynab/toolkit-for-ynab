function injectInitializer() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined') {

  (function($){
    $.event.special.destroyed = {
      remove: function(o) {
        if (o.handler) {
          o.handler()
        }
      }
    }
    })(jQuery)

    var collapseBtn = '<li> \
        <li class="ember-view navlink-collapse"> \
          <a href="#"> \
            <span class="ember-view flaticon stroke left-circle-4"></span>Collapse \
          </a> \
        </li> \
      </li>'

    var expandBtn = '<button class="button button-prefs flaticon stroke right-circle-4 navbar-expand"></button>'

    $(".init-loading").bind('destroyed', function() {
      $(".sidebar").prepend(expandBtn);
      $(".nav-main").append(collapseBtn);
      $(".navbar-expand").hide();

      $(".navlink-collapse").on("click", collapseMenu);
      $(".navbar-expand").on("click", expandMenu);
    })

    function collapseMenu() {
      $(".sidebar > .ember-view").hide();
      $(".sidebar").width("40px");
      $(".content").css("left", "40px");
      $(".budget-header").css("left", "40px");
      $(".budget-content").css("width", "73%");
      $(".budget-inspector").css("width", "27%");
      $(".ynab-grid-header").removeAttr("style");
      $(".navbar-expand").show();
    }

    function expandMenu() {
      $(".sidebar > .ember-view").show();
      $(".sidebar").width("260px");
      $(".content").css("left", "260px");
      $(".budget-header").css("left", "260px");
      $(".budget-content").css("width", "67%");
      $(".budget-inspector").css("width", "33%");
      $(".navbar-expand").hide();
    }

  } else {
    setTimeout(injectInitializer, 250);
  }
}

setTimeout(injectInitializer, 250);
