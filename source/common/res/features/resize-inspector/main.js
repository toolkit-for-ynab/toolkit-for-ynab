(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.resizeInspector = (function () {
      // Supporting functions,
      // or variables, etc

      return {
        asideWidth: '',

        invoke() {
          let asideWidth = ynabToolKit.shared.getToolkitStorageKey('budget-resize-inspector');

          if (typeof asideWidth !== 'undefined' && asideWidth !== null) {
            ynabToolKit.resizeInspector.asideWidth = asideWidth;
          }

          if ($('.ember-view.content .budget-inspector').length > 0) {
            if ($('.resize-inspector').length === 0) {
              $('.ember-view.content .scroll-wrap').addClass('resize-inspector');
              $('aside').before('<div class="inspector-resize-handle">&nbsp;</div>');
              $('.inspector-resize-handle').css('background-image', 'url(' + window.resizeInspectorAsset + ')');
              $('section').resizable({
                handleSelector: '.inspector-resize-handle',
                resizeHeight: false,
                maxWidth: 1400,
                onDragEnd: () => {
                  asideWidth = parseInt($('aside').width());

                  ynabToolKit.shared.setToolkitStorageKey('budget-resize-inspector', asideWidth);
                  ynabToolKit.resizeInspector.asideWidth = asideWidth;
                }
              });

              if (asideWidth !== '') {
                $('section').css('width', ynabToolKit.resizeInspector.getContentSize(false));
                // react to changed window size
                $(window).resize(function () {
                  if ($('.layout.collapsed').length) {
                    $('section').css('width', ynabToolKit.resizeInspector.getContentSizeCollapsed());
                  } else {
                    $('section').css('width', ynabToolKit.resizeInspector.getContentSize(false));
                  }
                });
              }
            }
          } else {
            $('.resize-inspector').removeClass('resize-inspector');
          }
        },

        getContentSize(externalCall) {
          var headerWidth = parseInt($('header').css('width').match(/.[^px]*/));
          var resizeHandleWidth = 13;
          var sectionWidth = parseInt(headerWidth) - parseInt(resizeHandleWidth) - ynabToolKit.resizeInspector.asideWidth - 21.2; // don't know why 21.2, but it works

          // Only subtract the 220 if this function was called externally.
          if ($('.layout.collapsed').length & externalCall) {
            // calculate non-collapsed layout
            sectionWidth -= 220;
          }
          return sectionWidth;
        },

        getContentSizeCollapsed() {
          return ynabToolKit.resizeInspector.getContentSize(false) + 220;
        },

        observe(changedNodes) {
          if (changedNodes.has('layout user-logged-in') ||
              changedNodes.has('active navlink-budget') ||
              changedNodes.has('navlink-collapse')) {
            // The user has switched screens
            ynabToolKit.resizeInspector.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.resizeInspector.invoke(); // Run itself once
  } else {
    setTimeout(poll, 250);
  }
}());
