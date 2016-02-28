(function poll() {
  if ( typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.resizeInspector = (function(){

      // Supporting functions,
      // or variables, etc

      return {
        invoke: function() {
          if( $('.ember-view.content .budget-inspector').length > 0 ) {
            if($('.resize-inspector').length === 0) {
              $('.ember-view.content .scroll-wrap').addClass('resize-inspector');
              $('aside').before('<div class="inspector-resize-handle">&nbsp;</div>');
              $('.inspector-resize-handle').css('background-image','url('+window.resizeInspectorAsset+')');
              $('section').resizable({
                handleSelector: '.inspector-resize-handle',
                resizeHeight: false
              });
            }
          } else {
            $('.resize-inspector').removeClass('resize-inspector');
          }
        },

        observe: function(changedNodes) {
          if (changedNodes.has('pure-g layout user-logged-in')) {
              // The user has switched screens
              ynabToolKit.resizeInspector.invoke();
          }
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.resizeInspector.invoke(); // Run itself once
   } else {
     setTimeout(poll, 250);
   }
})();
