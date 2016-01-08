function INotifications(){}function getPublicApi(){return utils.createApiWrapper(module.exports,INotifications.prototype)}var utils=require("kango/utils"),object=utils.object,EventTarget=utils.EventTarget,NotImplementedException=utils.NotImplementedException;INotifications.prototype={show:function(t,e,o,i){throw new NotImplementedException}};







function Notifications(){this._alertService=Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService)}var console=require("kango/console");Notifications.prototype={show:function(e,o,i,t){var r={observe:function(e,o,i){"alertclickcallback"===o&&t&&t()}};try{this._alertService.showAlertNotification(i||"",e,o,!0,0,r)}catch(c){console.reportError(c)}}},module.exports=new Notifications,module.exports.getPublicApi=getPublicApi;