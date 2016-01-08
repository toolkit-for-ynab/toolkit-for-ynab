"use strict";
_kangoLoader.add("kango/messaging", function(require, exports, module) {
function MessageSource(){this.dispatchMessage=function(e,s){}}function MessageRouterBase(){this._messageQueue=[]}var core=require("kango/core"),utils=require("kango/utils"),timer=require("kango/timer"),backgroundScriptEngine=require("kango/backgroundscript_engine"),array=utils.array,func=utils.func;MessageRouterBase.prototype={_dispatchMessagesFromQueue:function(){this._messageQueue.length>0&&(backgroundScriptEngine.isLoaded()?(array.forEach(this._messageQueue,function(e){core.fireEvent(e.name,e.event)}),this._messageQueue=[]):timer.setTimeout(func.bind(function(){this._dispatchMessagesFromQueue()},this),100))},fireMessageEvent:function(e,s){backgroundScriptEngine.isLoaded()?(this._dispatchMessagesFromQueue(),core.fireEvent("message",s)):(this._messageQueue.push({name:e,event:s}),timer.setTimeout(func.bind(function(){this._dispatchMessagesFromQueue()},this),100))},dispatchMessage:function(e,s){var i={name:e,data:s,origin:"background",target:this,source:this};return this.dispatchMessageEx(i)},dispatchMessageEx:function(e){return timer.setTimeout(func.bind(function(){this.fireMessageEvent("message",e)},this),1),!0}};







function MessageRouter(){MessageRouterBase.call(this),safari.application.addEventListener("message",func.bind(this._onMessage,this),!1)}var core=require("kango/core"),utils=require("kango/utils"),func=utils.func,object=utils.object,browser=require("kango/browser");MessageRouter.prototype=object.extend(MessageRouterBase,{_onMessage:function(e){if(e.target instanceof SafariBrowserTab){var s={name:e.name,data:e.message,origin:"tab",target:browser.getKangoTab(e.target),source:{dispatchMessage:function(s,a){return e.target.page.dispatchMessage(s,a),!0}}};this.fireMessageEvent("message",s)}}}),module.exports=new MessageRouter;
});