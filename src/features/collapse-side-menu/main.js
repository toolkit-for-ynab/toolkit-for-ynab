function ynabEnhancedCollapseInitializer() {
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
    setTimeout(ynabEnhancedCollapseInitializer, 250);
  }

  // Watch for the budget grid
  function watchBudgetGrid() {
    exists = false;

    if ($(".budget-toolbar").length) {
      exists = true;
    }
    if (exists) {
      setCollapsedSizes();
      setActiveButton();
   } else {
     setTimeout(watchBudgetGrid, 250);
   }
  }

  // Watch for the account grid
  function watchAccountGrid() {
    exists = false;

    if ($(".accounts-toolbar").length) {
      exists = true;
    }
    if (exists) {
      setCollapsedSizes();
      setActiveButton();
   } else {
     setTimeout(watchAccountGrid, 250);
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

  // Add buttons and handlers to screen
  function setupBtns() {
    var collapseBtn = '<li> \
      <li class="ember-view navlink-collapse"> \
        <a href="#"> \
          <span class="ember-view flaticon stroke left-circle-4"></span>Collapse \
        </a> \
      </li> \
    </li>'

    var budgetAction = $('.nav-main').find(".mail-1").closest("a").data('ember-action');
    var accountAction = $('.nav-main').find(".government-1").closest("a").data('ember-action');

    var expandBtns = '\
    <div class=collapsed-buttons> \
      <a href="#" data-ember-action="'+budgetAction+'" onClick="watchBudgetGrid()"> \
      <button class="button button-prefs flaticon stroke mail-1 collapsed-budget"></button> \
      </a> \
      <a href="#" data-ember-action="'+accountAction+'" onClick="watchAccountGrid()"> \
        <button class="button button-prefs flaticon stroke government-1 collapsed-account"></button> \
      </a> \
      <button class="button button-prefs flaticon stroke right-circle-4 navbar-expand"></button> \
    <div>';

    var originalSizes = {
      sidebarWidth:   $(".sidebar").width(),
      contentLeft:    $(".content").css("left"),
      headerLeft:     $(".budget-header").css("left"),
      contentWidth:   $(".budget-content").css("width"),
      inspectorWidth: $(".budget-inspector").css("width")
    }

    if (!$(".collapsed-buttons").length) {
      $(".sidebar").prepend(expandBtns);
    } else {
      $(".collapsed-buttons").remove();
      $(".sidebar").prepend(expandBtns);
    }

    $(".nav-main").append(collapseBtn);
    $(".collapsed-buttons").hide();

    $(".navlink-collapse").on("click", collapseMenu);
    $(".navbar-expand").on("click", function() {
      expandMenu(originalSizes)
    });

    // Monitor our button and set up watcher in case we change screens
    watchButton();
  }

  // Handle clicking expand button. Puts things back to original sizes
  function expandMenu(originalSizes) {
    $(".sidebar > .ember-view").show();
    $(".sidebar").width(originalSizes.sidebarWidth);
    $(".content").css("left", originalSizes.contentLeft);
    $(".budget-header").css("left", originalSizes.headerLeft);
    $(".budget-content").css("width", originalSizes.contentWidth);
    $(".budget-inspector").css("width", originalSizes.inspectorWidth);
    $(".collapsed-buttons").hide();
  }

  // Handle clicking the collapse button
  function collapseMenu() {
    setActiveButton();
    $(".sidebar > .ember-view").hide();
    $(".collapsed-buttons").show();
    setCollapsedSizes();
  }

  // Set collapsed sizes
  function setCollapsedSizes() {
    $(".sidebar").width("40px");
    $(".content").css("left", "40px");
    $(".budget-header").css("left", "40px");
    $(".budget-content").css("width", "73%");
    $(".budget-inspector").css("width", "27%");
    $(".ynab-grid-header").removeAttr("style");
  }

  // Add the active style to correct button
  function setActiveButton() {
    deactivateCollapsedActive();
    if ($(".accounts-toolbar").length) {
      $(".collapsed-account").addClass('collapsed-active');
    }
    if ($(".budget-toolbar").length) {
      $(".collapsed-budget").addClass('collapsed-active');
    }
  }

  // Deactivate collapsed buttons
  function deactivateCollapsedActive() {
    $(".collapsed-account").removeClass('collapsed-active');
    $(".collapsed-budget").removeClass('collapsed-active');
  }
}

setTimeout(ynabEnhancedCollapseInitializer, 250);
