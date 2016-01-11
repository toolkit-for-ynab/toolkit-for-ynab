function getTooltipTextFromPageInfo(info) {
    return 'Url: ' + info.url;
}

kango.addMessageListener('PageInfo', function(event) {
    // is message from active tab?
    if (event.target.isActive()) {
        kango.console.log('Page info received\nTarget tab url=' + event.target.getUrl());
        kango.ui.browserButton.setTooltipText(getTooltipTextFromPageInfo(event.data));
    }
});

kango.browser.addEventListener(kango.browser.event.TAB_CHANGED, function(event) {
    kango.console.log('TabChanged\nTarget tab url=' + event.target.getUrl() + '\nIs tab active=' + event.target.isActive() + '\nId=' + event.tabId);
    kango.ui.browserButton.setTooltipText('...');
    // Tab changed, request current page information
    event.target.dispatchMessage('GetPageInfo');
});
