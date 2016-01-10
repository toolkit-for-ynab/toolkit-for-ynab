KangoAPI.onReady(function() {

  var button = document.getElementById('openSettings');

  button.addEventListener('click', function() {
    kango.ui.optionsPage.open();
  }, false);

});
