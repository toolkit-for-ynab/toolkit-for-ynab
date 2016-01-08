kango.ui.contextMenuItem.addEventListener(kango.ui.contextMenuItem.event.CLICK, function() {
    kango.console.log('Context menu item click');
    kango.browser.tabs.getCurrent(function(tab) {
        tab.dispatchMessage('ContextMenuItemClick');
    });
});
