(function poll() {
   if ( typeof ynabToolKit !== 'undefined' && typeof $ !== 'undefined' && $('aside').length > 0 && $('section').length > 0 && ynabToolKit.actOnChangeInit) {

      ynabToolKit.resizeInspector = function ()  {
        if($('.ember-view.content .budget-inspector').length > 0 ) {
          if($('.resize-inspector').length == 0) {
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
      };

      ynabToolKit.resizeInspector(); // Run itself once
   } else {
     setTimeout(poll, 250);
   }    
})();
