(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.collapseSideMenu = new function() {

      this.invoke = function() {
        ynabToolKit.collapseSideMenu.setupBtns();
      };

      this.observe = function(changedNodes) {
        if (changedNodes.has('user-logged-in')) {
          if ($('.nav-main').length) {
            ynabToolKit.collapseSideMenu.setupBtns();
          }
        }

        if (changedNodes.has('budget-header-flexbox') &&
            $('.collapsed-buttons').is(':visible')) {
          ynabToolKit.collapseSideMenu.setCollapsedSizes();
          ynabToolKit.collapseSideMenu.setActiveButton();
        }

        if (changedNodes.has('accounts-header-balances') &&
            $('.collapsed-buttons').is(':visible')) {
          ynabToolKit.collapseSideMenu.setCollapsedSizes();
          ynabToolKit.collapseSideMenu.setActiveButton();
        }
      };

      // Add buttons and handlers to screen
      this.setupBtns = function() {

        // Don't proceed if buttons already exist
        if ($('.navlink-collapse').is(':visible') || $('.navbar-expand').is(':visible')) {
          return;
        }

        var buttonText = (ynabToolKit.l10nData && ynabToolKit.l10nData.Sidebar.Button.Collapse) || 'Collapse';
        var collapseBtn = '<li> \
          <li class="ember-view navlink-collapse"> \
            <a href="#"> \
              <span class="ember-view flaticon stroke left-circle-4"></span>' + buttonText + ' \
            </a> \
          </li> \
        </li>';

        var budgetAction = $('.nav-main').find('.mail-1').closest('a').data('ember-action');
        var accountAction = $('.nav-main').find('.government-1').closest('a').data('ember-action');

        var expandBtns = '\
        <div class=collapsed-buttons> \
          <a href="#" class="collapsed-budget-link" data-ember-action="'+budgetAction+'"> \
          <button class="button button-prefs flaticon stroke mail-1 collapsed-budget"></button> \
          </a> \
          <a href="#" class="collapsed-account-link" data-ember-action="'+accountAction+'"> \
            <button class="button button-prefs flaticon stroke government-1 collapsed-account"></button> \
          </a> \
          <button class="button button-prefs flaticon stroke right-circle-4 navbar-expand"></button> \
        <div>';

        var originalSizes = {
          sidebarWidth:   $('.sidebar').width(),
          contentLeft:    $('.content').css('left'),
          headerLeft:     $('.budget-header, .accounts-header').css('left'),
          contentWidth:   $('.budget-content').css('width'),
          inspectorWidth: $('.budget-inspector').css('width'),
        };

        if (!$('.collapsed-buttons').length) {
          $('.sidebar').prepend(expandBtns);
        } else {
          $('.collapsed-buttons').remove();
          $('.sidebar').prepend(expandBtns);
        }

        $('.nav-main').append(collapseBtn);
        $('.collapsed-buttons').hide();

        $('.navlink-collapse').on('click',
          ynabToolKit.collapseSideMenu.collapseMenu);
        $('.navbar-expand').on('click', function() {
          ynabToolKit.collapseSideMenu.expandMenu(originalSizes);
        });
      };

      // Handle clicking expand button. Puts things back to original sizes
      this.expandMenu = function(originalSizes) {
        $('.collapsed-buttons').hide();
        $('.sidebar > .ember-view').fadeIn();
        $('.sidebar').animate({ width: originalSizes.sidebarWidth });
        $('.content').animate({ left: originalSizes.contentLeft });
        $('.budget-header').animate({ left: originalSizes.headerLeft });
        $('.budget-content').animate({ width: originalSizes.contentWidth }, 400, 'swing', function() {
          // Need to remove width after animation completion
          $('.budget-content').removeAttr('style');
        });
        $('.budget-inspector').animate({ width: originalSizes.inspectorWidth });
      };

      // Handle clicking the collapse button
      this.collapseMenu = function() {
        ynabToolKit.collapseSideMenu.setActiveButton();
        $('.sidebar > .ember-view').hide();
        $('.collapsed-buttons').fadeIn();
        ynabToolKit.collapseSideMenu.setCollapsedSizes();
      };

      // Set collapsed sizes
      this.setCollapsedSizes = function() {
        $('.sidebar').animate({ width: '40px' });
        $('.content').animate({ left: '40px' }, 400, 'swing', function() {
          // Need to remove width after animation completion
          $('.ynab-grid-header').removeAttr('style');
        });

        $('.budget-header').animate({ left: '40px' });
        $('.budget-content').animate({ width: '73%' });
        $('.budget-inspector').animate({ width: '27%' });
      };

      // Add the active style to correct button
      this.setActiveButton = function() {
        ynabToolKit.collapseSideMenu.deactivateCollapsedActive();
        if ($('.accounts-toolbar').length) {
          $('.collapsed-account').addClass('collapsed-active');
        };

        if ($('.budget-toolbar').length) {
          $('.collapsed-budget').addClass('collapsed-active');
        }
      };

      // Deactivate collapsed buttons
      this.deactivateCollapsedActive = function() {
        $('.collapsed-account').removeClass('collapsed-active');
        $('.collapsed-budget').removeClass('collapsed-active');
      };
    };

    ynabToolKit.collapseSideMenu.invoke();

  } else {
    setTimeout(poll, 250);
  }
})();
