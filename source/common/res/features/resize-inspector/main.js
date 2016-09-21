(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.resizeInspector = (function () {
      // Supporting functions,
      // or variables, etc
      return {
        sectionWidth: '',
        invoke() {
          let sectionWidth = ynabToolKit.shared.getToolkitStorageKey('budget-resize-inspector');

          if (typeof sectionWidth !== 'undefined' && sectionWidth !== null) {
            ynabToolKit.resizeInspector.sectionWidth = sectionWidth;
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
                  ynabToolKit.shared.setToolkitStorageKey('budget-resize-inspector', width);
                }
              });

              if (sectionWidth !== '') {
                $('section').css('width', sectionWidth);
              }
            }
          } else {
            $('.resize-inspector').removeClass('resize-inspector');
          }
        },

        getContentSize() {
          return ynabToolKit.resizeInspector.sectionWidth;
        },

        observe(changedNodes) {
          if (changedNodes.has('layout user-logged-in') ||
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
