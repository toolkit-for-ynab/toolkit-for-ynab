/* eslint-disable no-multi-str */

(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.collapseSideMenu = (function () {
      // Supporting functions,
      // or variables, etc

      return {
        collapseBtn:
        $('<li>', { class: 'ember-view navlink-collapse' }).append(
          $('<a>', { href: '#' }).append(
            $('<span>', { class: 'ember-view flaticon stroke left-circle-4' })
          ).append(
            (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.collapse']) || 'Collapse'
          )
        ),

        originalButtons: {},

        originalSizes: {
          sidebarWidth: 0,
          contentLeft: 0,
          headerLeft: 0,
          contentWidth: 0,
          inspectorWidth: 0
        },

        setOriginalSizes() {
          ynabToolKit.collapseSideMenu.originalSizes = ({
            sidebarWidth: $('.sidebar').width(),
            contentLeft: $('.content').css('left'),
            headerLeft: $('.budget-header, .accounts-header').css('left'),
            contentWidth: $('.budget-content').outerWidth(),
            inspectorWidth: $('.budget-inspector').outerWidth()
          });
        },

        invoke() {
          ynabToolKit.collapseSideMenu.setupBtns();
        },

        observe(changedNodes) {
          if (changedNodes.has('layout user-logged-in')) {
            if ($('.nav-main').length) {
              ynabToolKit.collapseSideMenu.setupBtns();
            }
          }

          // if (changedNodes.has('sidebar-onboarding-close') && $('.collapsed-buttons').length) {
          //   $('.collapsed-buttons').remove();
          // }

          if (changedNodes.has('nav-main')) {
            var numNavLinks = $('.nav-main').children().length;
            var collapseIndex = $('.nav-main').children()
              .index($('.navlink-collapse'));
            var numCollapsedLinks = $('.collapsed-buttons').children().length;

            if (numNavLinks > (collapseIndex + 1) || numNavLinks > numCollapsedLinks) {
              $('.navlink-collapse').remove();

              ynabToolKit.collapseSideMenu.setUpCollapseBtn();
              ynabToolKit.collapseSideMenu.setUpCollapsedButtons();
            }
          }
        },

        // Add buttons and handlers to screen
        setupBtns() {
          // Don't proceed if buttons already exist
          if ($('.navlink-collapse').is(':visible') ||
              $('.navbar-expand').is(':visible')) {
            return;
          }

          ynabToolKit.collapseSideMenu.setUpCollapseBtn();
          ynabToolKit.collapseSideMenu.setUpCollapsedButtons();
        },

        setUpCollapseBtn() {
          $('.nav-main').append(ynabToolKit.collapseSideMenu.collapseBtn);
          $('body').on('click', '.navlink-collapse', function () {
            ynabToolKit.collapseSideMenu.collapseMenu();
          });
        },

        setUpCollapsedButtons() {
          var expandBtns = ynabToolKit.collapseSideMenu.getUnCollapseBtnGroup();

          $('.sidebar').prepend(expandBtns);

          if ($('.sidebar-contents').is(':visible')) {
            $('.collapsed-buttons').hide();
          }
        },

        getUnCollapseBtnGroup() {
          var navChildren = $('.nav-main').children();
          var navChildrenLength = navChildren.length;
          var collapsedBtnContainer = $('.collapsed-buttons');

          if (collapsedBtnContainer.length) {
            collapsedBtnContainer.children().remove();
            collapsedBtnContainer.hide();
          } else {
            collapsedBtnContainer = $('<div>', { class: 'collapsed-buttons', style: 'display: none' });
          }

          var clickFunction = function () {
            ynabToolKit.collapseSideMenu.originalButtons[this.className.replace(' active', '')].click();
            ynabToolKit.collapseSideMenu.deactivateCollapsedActive();
            $(this).addClass('active');
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
            link.attr('href', '#');
            link.addClass(linkClasses);
            link.html(button);
            link.click(clickFunction);

            ynabToolKit.collapseSideMenu.originalButtons[linkClasses.replace(' active', '')] = $(child).find('a');

            // Set proper class so the active styling can be applied
            if (btnClasses.indexOf('mail-1') > -1) {
              button.addClass('collapsed-budget');
            } else if (btnClasses.indexOf('graph-1') > -1) {
              button.addClass('collapsed-reports');
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

          $('body').on('click', '.navbar-expand', function () {
            ynabToolKit.collapseSideMenu.expandMenu(ynabToolKit.collapseSideMenu.originalSizes);
          });

          return collapsedBtnContainer;
        },

        // Handle clicking expand button. Puts things back to original sizes
        expandMenu(originalSizes) {
          $('.collapsed-buttons').hide();
          $('.sidebar > .ember-view').fadeIn();
          $('.navlink-collapse').show();

          $('.sidebar').animate({ width: originalSizes.sidebarWidth });
          $('.content').animate({ left: originalSizes.contentLeft }, function () {
            $('.layout').removeClass('collapsed');
          });

          $('.budget-header').animate({ left: originalSizes.headerLeft });
          if ($('.budget-content').is(':visible')) {
            if (ynabToolKit.options.resizeInspector) {
              $('.budget-content').animate({ width: ynabToolKit.resizeInspector.getContentSize(true) }, 400, 'swing', function () {
                $('.navlink-collapse').removeClass('collapsed').addClass('expanded');
              });
            } else {
              // if resize-inspector feature not on
              $('.budget-content').animate({ width: originalSizes.contentWidth }, 400, 'swing', function () {
                $('.budget-content').removeAttr('style');
                $('.navlink-collapse').removeClass('collapsed').addClass('expanded');
              });
              $('.budget-inspector').animate({ width: originalSizes.inspectorWidth });
            }
          }
        },

        // Handle clicking the collapse button
        collapseMenu() {
          // resize-inspector feature could have changed these so fetch current sizes.
          ynabToolKit.collapseSideMenu.setOriginalSizes();
          ynabToolKit.collapseSideMenu.setActiveButton($('.nav-main li.active').attr('class'));
          $('.navlink-collapse').hide();
          $('.sidebar > .ember-view').hide();
          $('.collapsed-buttons').fadeIn();

          $('.sidebar').animate({ width: '40px' });
          $('.content').animate({ left: '40px' }, 400, 'swing', function () {
            // Need to remove width after animation completion
            $('.ynab-grid-header').removeAttr('style');

            // We don't use these in our CSS, it's mostly so other features can observe
            // for collapse/expand and update sizes / do whatever. E.g. reports needs
            // to resize its canvas when this happens.
            $('.navlink-collapse').removeClass('expanded').addClass('collapsed');
            $('.layout').addClass('collapsed');
          });

          $('.budget-header').animate({ left: '40px' });
          if ($('.budget-content').is(':visible')) {
            if (ynabToolKit.options.resizeInspector) {
              $('.budget-content').animate({ width: ynabToolKit.resizeInspector.getContentSizeCollapsed() });
            } else {
              $('.budget-content').animate({ width: '73%' });
              $('.budget-inspector').animate({ width: '27%' });
            }
          }
        },

        // Add the active style to correct button
        setActiveButton(button) {
          if (typeof button !== 'undefined') {
            ynabToolKit.collapseSideMenu.deactivateCollapsedActive();
            button = button.replace('active', '').replace('ember-view', '').trim();
            $('.collapsed-buttons a.' + button).addClass('active');
          } else {
            $('.collapsed-buttons a').removeClass('active');
          }
        },

        // Deactivate collapsed buttons
        deactivateCollapsedActive() {
          $('.collapsed-buttons a').removeClass('active');
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.collapseSideMenu.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
