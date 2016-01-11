KangoAPI.onReady(function() {

  $('#openSettings').click(function() {
    kango.ui.optionsPage.open();
    KangoAPI.closeWindow();
  });

  $('#versionNumber').text(kango.getExtensionInfo().version);

  $('#openSettings').focus();
});
