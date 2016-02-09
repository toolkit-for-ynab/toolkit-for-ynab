(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.collapseSideMenu = new function() {

      this.collapseBtn = '<li> \
        <li class="ember-view navlink-collapse"> \
          <a href="#"> \
            <span class="ember-view flaticon stroke left-circle-4"></span>Collapse \
          </a> \
        </li> \
      </li>';

      this.invoke = function() {
        ynabToolKit.collapseSideMenu.setupBtns();
      };

      this.observe = function(changedNodes) {
        if (changedNodes.has('pure-g layout user-logged-in')) {
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

        if (changedNodes.has('nav-main')) {
          var numNavLinks = $('.nav-main').children().length;
          var collapseIndex = $('.nav-main').children()
            .index($('.navlink-collapse'));

          if (numNavLinks > (collapseIndex + 1)) {
            $('.navlink-collapse').remove();

            ynabToolKit.collapseSideMenu.setUpCollapseBtn();
          }

        }
      };

      // Add buttons and handlers to screen
      this.setupBtns = function() {

        // Don't proceed if buttons already exist
        if ($('.navlink-collapse').is(':visible') ||
            $('.navbar-expand').is(':visible')) {
          return;
        }

        var expandBtns = ynabToolKit.collapseSideMenu.getUnCollapseBtnGroup;

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

        ynabToolKit.collapseSideMenu.setUpCollapseBtn();

        $('.collapsed-buttons').hide();
        $('.navbar-expand').on('click', function() {
          ynabToolKit.collapseSideMenu.expandMenu(originalSizes);
        });
      };

      this.setUpCollapseBtn = function() {
        $('.nav-main').append(ynabToolKit.collapseSideMenu.collapseBtn);
        $('.navlink-collapse').on('click',
          ynabToolKit.collapseSideMenu.collapseMenu);
      };

      this.getUnCollapseBtnGroup = function() {
        var navChildren = $('.nav-main').children();
        var navChildrenLength = navChildren.length;

        var collapsedBtnContainer =
          $('<div>', {
            'class': 'collapsed-buttons'
          });

        for (var i = 0; i < navChildrenLength; i++) {
          var child = navChildren[i];
          var emberAction = $(child).find('a').data('ember-action');

          // Create YNAB Buttons
          if (emberAction) {
            var link = $('<a>');
            link.attr('href','#');
            link.attr('data-ember-action',emberAction);

            var btnClasses = $(child).find('span')[0].className;
            var button = $('<button>');
            button.addClass(btnClasses);
            button.addClass('button button-prefs');
            link.html(button);

            // Set proper class so the active styling can be applued
            if (btnClasses.indexOf('mail-1') > -1) {
              button.addClass('collapsed-budget');
            } else if (btnClasses.indexOf('government-1') > -1) {
              button.addClass('collapsed-account');
            }

            collapsedBtnContainer.append(link);
          }
        }

        // Add uncollapse button
        var collapseBtn = $('<button>');
        collapseBtn.addClass('button button-prefs flaticon stroke \
          right-circle-4 navbar-expand');

        collapsedBtnContainer.append(collapseBtn);
        $('.navlink-collapse').on('click',
          ynabToolKit.collapseSideMenu.collapseMenu);

        return collapsedBtnContainer;
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
