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

    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var observer = new MutationObserver(function(mutations, observer) {
      // Loop through all the mutations and nodes to see if navigation area was added
      mutations.forEach(function(mutation) {
        var nodes = mutation.addedNodes;
        for (i = 0, l = nodes.length; i < l; i++) {
          var children = nodes[i].childNodes;
          for (ii = 0, ll = children.length; ii < ll; ii++) {
            if (children[ii].className === "pure-u sidebar logged-in" ||
                children[ii].className === "nav-main") {
              // Found it! Add the buttons
              setUpBtns();
            }
          }
        }
      });
    });

    var options = {
      subtree: true,
      childList: true,
      characterData: true,
      attributeFilter: ['class']
    }

    // Observe entire document for page load
    observer.observe(document, options);

    // Can observe just sidebar once the page is loaded
    $(".init-loading").bind('destroyed', function() {
      var sidebar = document.querySelector('.sidebar');
      observer.observe(sidebar, options);
    });


    function setUpBtns() {
      var collapseBtn = '<li> \
          <li class="ember-view navlink-collapse"> \
            <a href="#"> \
              <span class="ember-view flaticon stroke left-circle-4"></span>Collapse \
            </a> \
          </li> \
        </li>'

      var expandBtn = '<button class="button button-prefs flaticon stroke right-circle-4 navbar-expand"></button>'

      var sizes = {
        sidebarWidth   : $(".sidebar").width(),
        contentLeft    : $(".content").css("left"),
        headerLeft     : $(".budget-header").css("left"),
        contentWidth   : $(".budget-content").css("width"),
        inspectorWidth : $(".budget-inspector").css("width")
      }

      if ($(".navbar-expand").length === 0) {
        $(".sidebar").prepend(expandBtn);
      }
      $(".nav-main").append(collapseBtn);
      $(".navbar-expand").hide();

      $(".navlink-collapse").on("click", collapseMenu);
      $(".navbar-expand").on("click", function() {
        expandMenu(sizes)
      });
    }

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

    function expandMenu(sizes) {
      $(".sidebar > .ember-view").show();
      $(".sidebar").width(sizes.sidebarWidth);
      $(".content").css("left", sizes.contentLeft);
      $(".budget-header").css("left", sizes.headerLeft);
      $(".budget-content").css("width", sizes.contentWidth);
      $(".budget-inspector").css("width", sizes.inspectorWidth);
      $(".navbar-expand").hide();
      }

  } else {
    setTimeout(injectInitializer, 250);
  }
}

setTimeout(injectInitializer, 250);
