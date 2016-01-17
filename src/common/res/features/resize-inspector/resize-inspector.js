(function poll() {
   if ( typeof ynabToolKit !== 'undefined' && typeof $ !== 'undefined' && $('aside').length > 0 && $('section').length > 0) {
       
      ynabToolKit.featureOptions.resizeInspector = true;
      ynabToolKit.resizeInspector = function ()  {
        $('aside').html('<div class="inspector-resize-handle">&nbsp;</div><div class="inspector-resize-content">'+$('aside').html()+'</div></div>');
        $('section').resizable({
          handleSelector: '.inspector-resize-handle',
          resizeHeight: false
        });
      };

      ynabToolKit.resizeInspector(); // Run itself once
   } else {
     setTimeout(poll, 250);
   }    
})();
