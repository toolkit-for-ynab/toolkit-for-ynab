function GmailChecker() {
    var self = this;
    self.refresh();
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
        kango.browser.tabs.create({url: 'https://mail.google.com/'});
        self.refresh();
    });
    window.setInterval(function() {
        self.refresh()
    }, self._refreshTimeout);
}

GmailChecker.prototype = {

    _refreshTimeout: 60 * 1000 * 15,    // 15 minutes
    _feedUrl: 'https://mail.google.com/mail/feed/atom',

    _setOffline: function() {
        kango.ui.browserButton.setTooltipText(kango.i18n.getMessage('Offline'));
        kango.ui.browserButton.setIcon('icons/button_gray.png');
        kango.ui.browserButton.setBadgeValue(0);
    },

    _setUnreadCount: function(count) {
        kango.ui.browserButton.setTooltipText(kango.i18n.getMessage('Unread count') + ': ' + count);
        kango.ui.browserButton.setIcon('icons/button.png');
        kango.ui.browserButton.setBadgeValue(count);
    },

    refresh: function() {
        var details = {
            url: this._feedUrl,
            method: 'GET',
            contentType: 'text'
        };
        var self = this;
        kango.xhr.send(details, function(data) {
            if (data.status == 200 && data.response != null) {
                var count = 0;
                var matches = data.response.match(/<fullcount>(\d+)<\/fullcount>/); // Old IE versions don't support getElementsByTagNameNS, so we have to use RegExp
                if (matches != null && matches.length > 0) {
                    count = matches[1];
                }
                self._setUnreadCount(count);
            } else { // something went wrong
                self._setOffline();
            }
        });
    }
};

var extension = new GmailChecker();