function getDomainFromUrl(url) {
    var matches = url.match(/:\/\/(.[^/]+)/);
    return ((matches != null && typeof matches[1] != 'undefined') ? matches[1] : null);
}

kango.browser.addEventListener(kango.browser.event.BEFORE_NAVIGATE, function(event) {
    kango.console.log('BeforeNavigate\nUrl=' + event.url + '\nIs tab active=' + event.target.isActive());
    var domain = getDomainFromUrl(event.url);
    // i don't like bing, redirect to google
    if (domain == 'www.bing.com' || domain == 'bing.com') {
        event.target.navigate('http://google.com/');
    }
});

kango.browser.addEventListener(kango.browser.event.DOCUMENT_COMPLETE, function(event) {
    kango.console.log('DocumentComplete\nUrl=' + event.url + '\nTitle=' + event.title + '\nIs tab active=' + event.target.isActive());
});

kango.browser.addEventListener(kango.browser.event.TAB_CREATED, function(event) {
    kango.console.log('Tab Created\nTarget tab url=' + event.target.getUrl() + '\nTab id=' + event.tabId);
});

kango.browser.addEventListener(kango.browser.event.TAB_CHANGED, function(event) {
    kango.console.log('Tab Changed\nTarget tab url=' + event.target.getUrl() + '\nTab id=' + event.tabId);
});

kango.browser.addEventListener(kango.browser.event.TAB_REMOVED, function(event) {
    kango.console.log('Tab Removed\nTab id=' + event.tabId);
});

kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
    // output to console all opened tabs urls
    kango.browser.tabs.getAll(function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            kango.console.log(tabs[i].getUrl())
        }
    });
});
