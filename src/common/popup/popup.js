function applyDarkMode(activate) {
  if (activate) {
    $('body').addClass('inverted');
  } else {
    $('body').removeClass('inverted');
  }
}

KangoAPI.onReady(function() {

  kango.invokeAsync('kango.storage.getItem', 'options.dark-mode', function(data) {
    applyDarkMode(data);
  });
  
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

  $('#reportBug').click(function () {

    // For some reason Safari doesn't like links in popovers.
    // The other browsers will work with just the link so we don't need to
    // do anything with them in the click handler.
    if (kango.browser.getName() == 'safari') {
      // Open the link.
      safari.application.activeBrowserWindow.openTab().url = $(this).attr('href');

      // Close the popover.
      KangoAPI.closeWindow();
    }
  });

  $('#versionNumber').text(kango.getExtensionInfo().version);

  $('#logo').attr('src', kango.io.getResourceUrl('assets/logos/toolkitforynab-logo-200.png'));

  $('#openSettings').focus();
});
