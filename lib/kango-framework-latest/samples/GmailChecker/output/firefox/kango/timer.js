function ITimer(){}function getPublicApi(){return utils.createApiWrapper(module.exports,ITimer.prototype)}var utils=require("kango/utils"),NotImplementedException=utils.NotImplementedException;ITimer.prototype={setInterval:function(e,t){return new NotImplementedException},clearInterval:function(e){return new NotImplementedException},setTimeout:function(e,t){return new NotImplementedException},clearTimeout:function(e){return new NotImplementedException}};







function Timer(){this._timers={},this._lastId=0}var utils=require("kango/utils"),object=utils.object,array=utils.array,func=utils.func;Timer.prototype={dispose:function(){var i=object.getKeys(this._timers);array.forEach(i,function(i){this._clearTimer(i)},this)},_setTimer:function(i,t,e){var r=Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer),s=++this._lastId;return this._timers[s]=r,r.initWithCallback({notify:func.bind(function(){e==Ci.nsITimer.TYPE_ONE_SHOT&&(this._clearTimer(s),i())},this)},t,e),s},_clearTimer:function(i){if("undefined"!=typeof this._timers[i]){var t=this._timers[i];delete this._timers[i],t.cancel()}},setInterval:function(i,t){return this._setTimer(i,t,Ci.nsITimer.TYPE_REPEATING_SLACK)},clearInterval:function(i){return this._clearTimer(i)},setTimeout:function(i,t){return this._setTimer(i,t,Ci.nsITimer.TYPE_ONE_SHOT)},clearTimeout:function(i){this._clearTimer(i)}},module.exports=new Timer,module.exports.getPublicApi=getPublicApi;