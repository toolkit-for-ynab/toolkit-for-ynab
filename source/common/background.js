function YNABEnhanced() {
  kango.ui.browserButton.setPopup({
    url: 'popup/popup.html',
    width: 330,
    height: 260
  });
}

YNABEnhanced.prototype = {
  checkForUpdatesInBackground: function() {

    // Chrome doesn't auto update for everyone. Let's check and make sure
    // we're on the latest every 10 mins or so.
    if (kango.browser.getName() == 'chrome') {
      
      chrome.runtime.onUpdateAvailable.addListener(function(details) {
        console.log("updating to version " + details.version);
        chrome.runtime.reload();
      });

      setInterval(function() {

        console.log("Checking for update");

        chrome.runtime.requestUpdateCheck(function(status) {
          if (status == "update_available") {
            console.log("update pending...");
          } else if (status == "no_update") {
            console.log("no update found");
          } else if (status == "throttled") {
            console.log("I'm asking too frequently - I need to back off.");
          }
        });
      }, 3600000);
    }
  }
};

var extension = new YNABEnhanced();

extension.checkForUpdatesInBackground();
