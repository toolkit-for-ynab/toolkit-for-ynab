function MessageSource(){this.dispatchMessage=function(e,s){}}function MessageRouterBase(){this._messageQueue=[]}var core=require("kango/core"),utils=require("kango/utils"),timer=require("kango/timer"),backgroundScriptEngine=require("kango/backgroundscript_engine"),array=utils.array,func=utils.func;MessageRouterBase.prototype={_dispatchMessagesFromQueue:function(){this._messageQueue.length>0&&(backgroundScriptEngine.isLoaded()?(array.forEach(this._messageQueue,function(e){core.fireEvent(e.name,e.event)}),this._messageQueue=[]):timer.setTimeout(func.bind(function(){this._dispatchMessagesFromQueue()},this),100))},fireMessageEvent:function(e,s){backgroundScriptEngine.isLoaded()?(this._dispatchMessagesFromQueue(),core.fireEvent("message",s)):(this._messageQueue.push({name:e,event:s}),timer.setTimeout(func.bind(function(){this._dispatchMessagesFromQueue()},this),100))},dispatchMessage:function(e,s){var i={name:e,data:s,origin:"background",target:this,source:this};return this.dispatchMessageEx(i)},dispatchMessageEx:function(e){return timer.setTimeout(func.bind(function(){this.fireMessageEvent("message",e)},this),1),!0}};







function MessageRouter(){MessageRouterBase.apply(this,arguments)}var utils=require("kango/utils"),object=utils.object;MessageRouter.prototype=object.extend(MessageRouterBase,{}),module.exports=new MessageRouter;