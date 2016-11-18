(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.resizeInspector = (function () {
      // Supporting functions,
      // or variables, etc
      return {
        sectionWidth: '',
        sectionWidthCollapsed: '',

        invoke() {
          let sectionWidth = ynabToolKit.shared.getToolkitStorageKey('budget-resize-inspector');
          let sectionWidthCollapsed = parseInt(ynabToolKit.shared.getToolkitStorageKey('budget-resize-inspector')) + 220;

          if (typeof sectionWidth !== 'undefined' && sectionWidth !== null) {
            ynabToolKit.resizeInspector.sectionWidth = sectionWidth;
            ynabToolKit.resizeInspector.sectionWidthCollapsed = parseInt(sectionWidth) + 220;
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
                  let width = $('section').css('width').match(/.[^px]*/);

                  if (!$('.layout.collapsed').length) {
                    // save values based on non-collapsed layout
                    ynabToolKit.shared.setToolkitStorageKey('budget-resize-inspector', width);
                    ynabToolKit.resizeInspector.sectionWidth = width;
                    ynabToolKit.resizeInspector.sectionWidthCollapsed = parseInt(width) + 220;
                  } else {
                    // save values based on collapsed layout
                    ynabToolKit.shared.setToolkitStorageKey('budget-resize-inspector', parseInt(width) - 220);
                    ynabToolKit.resizeInspector.sectionWidth = parseInt(width) - 220;
                    ynabToolKit.resizeInspector.sectionWidthCollapsed = width;
                  }
                }
              });

              if (sectionWidth !== '') {
                if (ynabToolKit.options.collapseSideMenu && $('.layout.collapsed').length) {
                  $('section').css('width', sectionWidthCollapsed);
                } else {
                  $('section').css('width', sectionWidth);
                }
              }
            }
          } else {
            $('.resize-inspector').removeClass('resize-inspector');
          }
        },

        getContentSize() {
          return ynabToolKit.resizeInspector.sectionWidth;
        },

        getContentSizeCollapsed() {
          return ynabToolKit.resizeInspector.sectionWidthCollapsed;
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
