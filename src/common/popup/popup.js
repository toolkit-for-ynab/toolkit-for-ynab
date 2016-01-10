KangoAPI.onReady(function() {

  $('#openSettings').click(function() {
    kango.ui.optionsPage.open();
  });

  $('#versionNumber').text(kango.getExtensionInfo().version);

  $('#openSettings').focus();
});
