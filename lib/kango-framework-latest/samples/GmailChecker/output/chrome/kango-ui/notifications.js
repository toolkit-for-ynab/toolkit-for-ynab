"use strict";
_kangoLoader.add("kango-ui/notifications", function(require, exports, module) {
function INotifications(){}function getPublicApi(){return utils.createApiWrapper(module.exports,INotifications.prototype)}var utils=require("kango/utils"),object=utils.object,EventTarget=utils.EventTarget,NotImplementedException=utils.NotImplementedException;INotifications.prototype={show:function(t,e,o,i){throw new NotImplementedException}};







function Notifications(){this._clickCallbacks={},this._lastId=0,"undefined"!=typeof chrome.notifications&&chrome.notifications.onClicked.addListener(func.bind(function(i){this._fireNotificationEvent(i)},this))}var utils=require("kango/utils"),func=utils.func;Notifications.prototype={_fireNotificationEvent:function(i){this._clickCallbacks[i]&&this._clickCallbacks[i]()},_getNextId:function(){return(++this._lastId).toString()},show:function(i,t,c,n){var o=this._getNextId();chrome.notifications.create(o,{type:"basic",iconUrl:c||"",title:i,message:t},function(){}),n&&(this._clickCallbacks[o]=n)}},module.exports=new Notifications,module.exports.getPublicApi=getPublicApi;
});