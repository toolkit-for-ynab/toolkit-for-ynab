"use strict";
_kangoLoader.add("kango/timer", function(require, exports, module) {
function ITimer(){}function getPublicApi(){return utils.createApiWrapper(module.exports,ITimer.prototype)}var utils=require("kango/utils"),NotImplementedException=utils.NotImplementedException;ITimer.prototype={setInterval:function(e,t){return new NotImplementedException},clearInterval:function(e){return new NotImplementedException},setTimeout:function(e,t){return new NotImplementedException},clearTimeout:function(e){return new NotImplementedException}};







function Timer(){}Timer.prototype={setInterval:function(e,t){return window.setInterval(e,t)},clearInterval:function(e){return window.clearInterval(e)},setTimeout:function(e,t){return window.setTimeout(e,t)},clearTimeout:function(e){return window.clearTimeout(e)}},module.exports=new Timer,module.exports.getPublicApi=getPublicApi;
});