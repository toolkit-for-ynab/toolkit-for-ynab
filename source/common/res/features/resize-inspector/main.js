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
                $('section').css('width', ynabToolKit.resizeInspector.getContentSize());
                // react to changed window size
                $(window).resize(function () {
                  $('section').css('width', ynabToolKit.resizeInspector.getContentSize());
                });
              }
            }
          } else {
            $('.resize-inspector').removeClass('resize-inspector');
          }
        },

        getContentSize() {
          var headerWidth = parseInt($('header').css('width').match(/.[^px]*/));
          var resizeHandleWidth = 13;
          var sectionWidth = parseInt(headerWidth) - parseInt(resizeHandleWidth) - ynabToolKit.resizeInspector.asideWidth - 21.2; // don't know why 21.2, but it works
          if ($('.layout.collapsed').length) {
            // calculate non-collapsed layout
            sectionWidth -= 220;
          }
          return sectionWidth;
        },

        getContentSizeCollapsed() {
          return ynabToolKit.resizeInspector.getContentSize() + 220;
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
