// ==UserScript==
// @name ContextMenuItemDemo
// @include http://*
// @include https://*
// ==/UserScript==

function handleContextMenuClick() {
    var clickedElement = null;

    if ('addEventListener' in document) {
        document.addEventListener('mousedown', function(event) {
            if (event.button == 2) {
                clickedElement = event.target;
            }
        }, true);
    } else {
        document.attachEvent('onmousedown', function(event) {
            event = event || window.event;
            if (event.button == 2) {
                clickedElement = event.srcElement;
            }
        });
    }

    kango.addMessageListener('ContextMenuItemClick', function(event) {
        alert(clickedElement);
    });
}

handleContextMenuClick();