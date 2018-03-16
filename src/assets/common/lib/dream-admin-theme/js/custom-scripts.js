/*------------------------------------------------------
    Author : www.webthemez.com
    License: Commons Attribution 3.0
    http://creativecommons.org/licenses/by/3.0/
---------------------------------------------------------  */

(function($) {
  "use strict";
  var mainApp = {

      initFunction: function() {
        $(window).bind("load resize", function() {
          if ($(this).width() < 768) {
            $('div.sidebar-collapse').addClass('collapse')
          } else {
            $('div.sidebar-collapse').removeClass('collapse')
          }
        });
      },

      initialization: function() {
        mainApp.initFunction();
      }
    }
    // Initializing ///

  $(document).ready(function() {
    mainApp.initFunction();
  });

}(jQuery));
