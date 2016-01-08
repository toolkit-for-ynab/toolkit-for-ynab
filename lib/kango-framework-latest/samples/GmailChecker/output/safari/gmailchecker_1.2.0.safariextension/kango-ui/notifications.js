"use strict";
_kangoLoader.add("kango-ui/notifications", function(require, exports, module) {
function INotifications(){}function getPublicApi(){return utils.createApiWrapper(module.exports,INotifications.prototype)}var utils=require("kango/utils"),object=utils.object,EventTarget=utils.EventTarget,NotImplementedException=utils.NotImplementedException;INotifications.prototype={show:function(t,e,o,i){throw new NotImplementedException}};







function Notifications(){}Notifications.prototype={show:function(i,o,t,n){if(window.Notification){var c=new Notification(i,{body:o,icon:t});c.onclick=n,c.show()}}},module.exports=new Notifications,module.exports.getPublicApi=getPublicApi;
});