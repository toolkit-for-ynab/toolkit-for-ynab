// ==UserScript==
// @name MessagingDemo
// @include http://*
// @include https://*
// ==/UserScript==

function postPageInfoMessage() {
    var pageInfo = {
        url: document.URL
    };

    kango.console.log('Sending page info...');

    // dispatch messsage to background script
    kango.dispatchMessage('PageInfo', pageInfo);
}

postPageInfoMessage();

// handle messages from background script
kango.addMessageListener('GetPageInfo', function(event) {
    postPageInfoMessage();
});