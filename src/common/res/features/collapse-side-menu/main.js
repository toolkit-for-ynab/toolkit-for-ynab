// jscs:disable disallowMultipleLineStrings
// jshint multistr: true

(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.collapseSideMenu = (function(){

      // Supporting functions,
      // or variables, etc

      return {
        collapseBtn:
        $('<li>', { class: 'ember-view navlink-collapse' }).append(
          $('<a>', { href: '#' }).append(
            $('<span>', { class: 'ember-view flaticon stroke left-circle-4' })
          ).append(
            (ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.collapse"]) || 'Collapse'
          )
        ),

        originalButtons: {},

        originalSizes: {
          sidebarWidth:   $('.sidebar').width(),
          contentLeft:    $('.content').css('left'),
          headerLeft:     $('.budget-header, .accounts-header').css('left'),
          contentWidth:   $('.budget-content').css('width'),
          inspectorWidth: $('.budget-inspector').css('width'),
        },

        invoke: function() {
          ynabToolKit.collapseSideMenu.setupBtns();
        },

        observe: function(changedNodes) {
          if (changedNodes.has('pure-g layout user-logged-in')) {
            if ($('.nav-main').length) {
              ynabToolKit.collapseSideMenu.setupBtns();
            }
          }

          changedNodes.forEach(function (changedNode) {
            if ($('.collapsed-buttons').is(':visible') &&
                changedNode.startsWith('navlink-') && changedNode.endsWith(' active')) {

              ynabToolKit.collapseSideMenu.setCollapsedSizes();
              ynabToolKit.collapseSideMenu.setActiveButton();
            }
          });

          if (changedNodes.has('nav-main')) {
            var numNavLinks = $('.nav-main').children().length;
            var collapseIndex = $('.nav-main').children()
              .index($('.navlink-collapse'));

            if (numNavLinks > (collapseIndex + 1)) {
              $('.navlink-collapse').remove();

              ynabToolKit.collapseSideMenu.setUpCollapseBtn();
              ynabToolKit.collapseSideMenu.setUpCollapsedButtons();
            }

          }
        },

        // Add buttons and handlers to screen
        setupBtns: function() {

          // Don't proceed if buttons already exist
          if ($('.navlink-collapse').is(':visible') ||
              $('.navbar-expand').is(':visible')) {
            return;
          }

          ynabToolKit.collapseSideMenu.setUpCollapseBtn();
          ynabToolKit.collapseSideMenu.setUpCollapsedButtons();
        },

        setUpCollapseBtn: function() {
          $('.nav-main').append(ynabToolKit.collapseSideMenu.collapseBtn);
          $('.navlink-collapse').on('click',
            ynabToolKit.collapseSideMenu.collapseMenu);
        },

        setUpCollapsedButtons: function() {
          var expandBtns = ynabToolKit.collapseSideMenu.getUnCollapseBtnGroup();

          if (!$('.collapsed-buttons').length) {
            $('.sidebar').prepend(expandBtns);
          } else {
            $('.collapsed-buttons').remove();
            $('.sidebar').prepend(expandBtns);
          }

          $('.collapsed-buttons').hide();
        },

        getUnCollapseBtnGroup: function() {
          var navChildren = $('.nav-main').children();
          var navChildrenLength = navChildren.length;

          var collapsedBtnContainer =
            $('<div>', {
              'class': 'collapsed-buttons'
            });

          clickFunction = function() {
            ynabToolKit.collapseSideMenu.originalButtons[this.className.replace(' active', '')].click();
          };
          for (var i = 0; i < navChildrenLength; i++) {
            var child = navChildren[i];

            // If this is the collapse button, skip
            if (child.className.indexOf('navlink-collapse') > -1) {
              continue;
            }

            var span = $(child).find('span')[0];

            // Don't process if not actually a button
            if (!span) {
              continue;
            }

            var btnClasses = span.className;
            var button = $('<button>');
            button.addClass(btnClasses);
            button.addClass('button button-prefs');

            var listItem = $(child).find('li')[0] || child;
            var linkClasses = listItem.className.replace(' active', '');

            var link = $('<a>');
            link.attr('href','#');
            link.addClass(linkClasses);
            link.html(button);
            link.click(clickFunction);

            ynabToolKit.collapseSideMenu.originalButtons[linkClasses.replace(' active', '')] = $(child).find('a');

            // Set proper class so the active styling can be applied
            if (btnClasses.indexOf('mail-1') > -1) {
              button.addClass('collapsed-budget');
            } else if (btnClasses.indexOf('government-1') > -1) {
              button.addClass('collapsed-account');
            } else {
              // Fallback if we don't know what the button is.
              button.addClass('collapsed');
            }

            collapsedBtnContainer.append(link);
          }

          // Add uncollapse button
          var collapseBtn = $('<button>');
          collapseBtn.addClass('button button-prefs flaticon stroke \
            right-circle-4 navbar-expand');

          collapsedBtnContainer.append(collapseBtn);

          $('body').on('click', '.navbar-expand', function() {
            ynabToolKit.collapseSideMenu.expandMenu(ynabToolKit.collapseSideMenu.originalSizes);
          });

          return collapsedBtnContainer;
        },

        // Handle clicking expand button. Puts things back to original sizes
        expandMenu: function(originalSizes) {
          $('.collapsed-buttons').hide();
          $('.sidebar > .ember-view').fadeIn();
          $('.navlink-collapse').show();
          $('.sidebar').animate({width: originalSizes.sidebarWidth});
          $('.content').animate({left: originalSizes.contentLeft});
          $('.budget-header').animate({left: originalSizes.headerLeft});
          $('.budget-content').animate({width: originalSizes.contentWidth}, 400, 'swing', function() {
            // Need to remove width after animation completion
            $('.budget-content').removeAttr('style');
          });
          $('.budget-inspector').animate({width: originalSizes.inspectorWidth});
        },

        // Handle clicking the collapse button
        collapseMenu: function() {
          ynabToolKit.collapseSideMenu.setActiveButton();
          $('.navlink-collapse').hide();
          $('.sidebar > .ember-view').hide();
          $('.collapsed-buttons').fadeIn();
          ynabToolKit.collapseSideMenu.setCollapsedSizes();
        },

        // Set collapsed sizes
        setCollapsedSizes: function() {
          $('.sidebar').animate({width: '40px'});
          $('.content').animate({left: '40px'}, 400, 'swing', function() {
            // Need to remove width after animation completion
            $('.ynab-grid-header').removeAttr('style');
          });

          $('.budget-header').animate({left: '40px'});
          $('.budget-content').animate({width: '73%'});
          $('.budget-inspector').animate({width: '27%'});
        },

        // Add the active style to correct button
        setActiveButton: function() {
          ynabToolKit.collapseSideMenu.deactivateCollapsedActive();

          var originalButtons = ynabToolKit.collapseSideMenu.originalButtons;

          for (var classList in originalButtons) {
            if (originalButtons.hasOwnProperty(classList)) {
              var originalButton = $(originalButtons[classList]).closest('.ember-view');

              if (originalButton.hasClass('active')) {

                // Set the active button in the collapsed panel.
                var collapsedSelector = '.collapsed-buttons .' +
                        $(originalButton).attr('class')
                          .replace(' active', '')
                          .replace(' ', '.') +
                            ' button';

                $(collapsedSelector).addClass('collapsed-active');
              }
            }
          }
        },

        // Deactivate collapsed buttons
        deactivateCollapsedActive: function() {
          $('.collapsed-buttons a button').removeClass('collapsed-active');
          $('.collapsed-buttons a').removeClass('active');
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.collapseSideMenu.invoke();

  } else {
    setTimeout(poll, 250);
  }
})();
