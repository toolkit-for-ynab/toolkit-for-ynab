KangoAPI.onReady(function() {

  $('#openSettings').click(function() {

    // Chrome requires the "tabs" permission to open the options page.
    // We don't want to ask for this permission because it has an ominous
    // message about being able to read your entire browsing history.
    // For some reason, kango isn't using chrome.runtime.openOptionsPage().
    if (kango.browser.getName() == 'chrome') {
      chrome.runtime.openOptionsPage();
    } else {
      kango.ui.optionsPage.open();
    }
    
    KangoAPI.closeWindow();
  });

  $('#versionNumber').text(kango.getExtensionInfo().version);

  $('#logo').attr('src', kango.io.getResourceUrl('assets/logos/toolkitforynab-logo-200.png'));

  $('#openSettings').focus();
});
