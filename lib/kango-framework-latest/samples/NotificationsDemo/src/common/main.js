var counter = 0;

kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function(event) {
    kango.ui.notifications.show('Title', 'Notification number ' + (++counter), 'http://kangoextensions.com/images/logos/kango.png', function() {
        kango.console.log('Notification click');
    });
});