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

    // Wait for loading thingy to go away
    $(".init-loading").bind('destroyed', function() {
      // Check if the sidebar exists
      if ($(".nav-main").length){
        setupBtns();
      } else {
        setTimeout(watchSidebar, 250);
      }
    });
  } else {
    setTimeout(injectInitializer, 250);
  }
}

setTimeout(injectInitializer, 250);

// Watch for the sidebar on screens where it doesn't exist
function watchSidebar() {
  exists = false;
  if ($(".nav-main").length) {
    exists = true;
  }
  if (exists) {
   setupBtns();
 } else {
   setTimeout(watchSidebar, 250);
 }
}

// Watch that the button is still there
function watchButton() {
  exists = false;
  if ($(".navlink-collapse").length) {
    exists = true;
  }
  if (!exists) {
   watchSidebar();
 } else {
   setTimeout(watchButton, 1000);
 }
}

// Add buttons and handlers to screen
function setupBtns() {
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

  var expandBtn = '<button class="button button-prefs flaticon stroke right-circle-4 navbar-expand"></button>';

  var originalSizes = {
    sidebarWidth:   $(".sidebar").width(),
    contentLeft:    $(".content").css("left"),
    headerLeft:     $(".budget-header").css("left"),
    contentWidth:   $(".budget-content").css("width"),
    inspectorWidth: $(".budget-inspector").css("width")
  }

  if (!$(".navbar-expand").length) {
    $(".sidebar").prepend(expandBtn);
  }
  $(".nav-main").append(collapseBtn);
  $(".navbar-expand").hide();

  $(".navlink-collapse").on("click", collapseMenu);
  $(".navbar-expand").on("click", function() {
    expandMenu(originalSizes)
  });

  // Monitor our button and set up watcher in case we change screens
  watchButton();
}

// Handle clicking the collapse button
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

// Handle clicking expand button. Puts things back to original sizes
function expandMenu(originalSizes) {
  $(".sidebar > .ember-view").show();
  $(".sidebar").width(originalSizes.sidebarWidth);
  $(".content").css("left", originalSizes.contentLeft);
  $(".budget-header").css("left", originalSizes.headerLeft);
  $(".budget-content").css("width", originalSizes.contentWidth);
  $(".budget-inspector").css("width", originalSizes.inspectorWidth);
  $(".navbar-expand").hide();
}