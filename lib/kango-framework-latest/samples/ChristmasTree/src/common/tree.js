// ==UserScript==
// @name ChristmasTree
// @include http://*
// @include https://*
// @include about:blank
// @require jquery-1.9.1.min.js
// ==/UserScript==

var $ = window.$.noConflict(true); // Required for IE

var tree = $(document.createElement('img')).attr({
    src: 'http://kangoextensions.com/misc/tree.png',
    title: 'Christmas tree'
}).css({
    position: 'absolute',
    top: '10px',
    left: document.body.clientWidth - 280 + 'px',
    'z-index': '10000'
}).appendTo(document.body);

tree.click(function() {
    alert('Tree click');
});