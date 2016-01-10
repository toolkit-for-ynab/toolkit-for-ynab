"use strict";
_kangoLoader.add("kango/storage", function(require, exports, module) {
function IStorage(){}function JSONStorage(e){EventTarget.call(this),this._storageEngine=e}function getPublicApi(){return utils.createApiWrapper(module.exports.storage,IStorage.prototype)}var utils=require("kango/utils"),array=utils.array,object=utils.object,EventTarget=utils.EventTarget,NotImplementedException=utils.NotImplementedException;IStorage.prototype={setItem:function(e,t){throw new NotImplementedException},getItem:function(e){throw new NotImplementedException},removeItem:function(e){throw new NotImplementedException},getKeys:function(){throw new NotImplementedException},clear:function(){throw new NotImplementedException}},JSONStorage.prototype=object.extend(EventTarget,{_storageEngine:null,getItem:function(e){var t=this._storageEngine.getItem(e);return"undefined"!=typeof t&&null!=t?JSON.parse(t):null},setItem:function(e,t){if("undefined"==typeof t)return this.removeItem(e);var n=JSON.stringify(t);return"undefined"!=typeof n&&(this._storageEngine.setItem(e,n),this.fireEvent("setItem",{data:{name:e,value:t}})),!1},removeItem:function(e){this._storageEngine.removeItem(e),this.fireEvent("removeItem",{data:{name:e}})},getKeys:function(){return this._storageEngine.getKeys()},getItems:function(){var e={};return array.forEach(this.getKeys(),function(t){e[t]=this.getItem(t)},this),e},clear:function(){this._storageEngine.clear(),this.fireEvent("clear")},dispose:function(){this.removeAllEventListeners(),"undefined"!=typeof this._storageEngine.dispose&&this._storageEngine.dispose(),this._storageEngine=null}});







function UserStorage(t){this._storageEngine=t}function SystemStorage(t){this._storageEngine=t}var utils=require("kango/utils"),array=utils.array,SYSTEM_STORAGE_PREFIX="{772ED927-1623-4E2C-94CC-D5E488E34C5B}_SystemStorage.";UserStorage.prototype={getItem:function(t){return this._storageEngine.getItem(t)},setItem:function(t,e){return this._storageEngine.setItem(t,e)},removeItem:function(t){return this._storageEngine.removeItem(t)},clear:function(){array.forEach(this.getKeys(),function(t){this.removeItem(t)},this)},getKeys:function(){return array.filter(this._storageEngine.getKeys(),function(t){return 0!=t.indexOf(SYSTEM_STORAGE_PREFIX)})}},SystemStorage.prototype={getItem:function(t){return this._storageEngine.getItem(SYSTEM_STORAGE_PREFIX+t)},setItem:function(t,e){return this._storageEngine.setItem(SYSTEM_STORAGE_PREFIX+t,e)},removeItem:function(t){return this._storageEngine.removeItem(SYSTEM_STORAGE_PREFIX+t)},clear:function(){array.forEach(this.getKeys(),function(t){this.removeItem(t)},this)},getKeys:function(){return array.filter(this._storageEngine.getKeys(),function(t){return 0==t.indexOf(SYSTEM_STORAGE_PREFIX)})}};







function LocalStorage(){}LocalStorage.prototype={getItem:function(e){return localStorage.getItem(e)},setItem:function(e,t){return localStorage.setItem(e,t)},removeItem:function(e){return localStorage.removeItem(e)},clear:function(){return localStorage.clear()},getKeys:function(){for(var e=localStorage.length,t=new Array(e),o=0;e>o;o++)t[o]=localStorage.key(o);return t}},module.exports.storage=new JSONStorage(new UserStorage(new LocalStorage)),module.exports.systemStorage=new JSONStorage(new SystemStorage(new LocalStorage)),module.exports.getPublicApi=getPublicApi;
});