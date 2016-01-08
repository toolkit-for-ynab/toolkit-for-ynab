"use strict";
_kangoLoader.add("kango/io", function(require, exports, module) {
function getPublicApi(){return utils.createApiWrapper(module.exports,IOBase.prototype)}var utils=require("kango/utils"),NotImplementedException=utils.NotImplementedException,IOBase=function(){};IOBase.prototype={getExtensionFileUrl:function(e){throw new NotImplementedException},isLocalUrl:function(e){return-1==e.indexOf("http://")&&-1==e.indexOf("https://")&&-1==e.indexOf("ftp://")},getFileUrl:function(e){return this.isLocalUrl(e)&&(e=this.getExtensionFileUrl(e)),e},getExtensionFileContents:function(e){var t=new XMLHttpRequest;t.open("GET",this.getExtensionFileUrl(e),!1),"undefined"!=typeof t.overrideMimeType&&t.overrideMimeType("text/plain");try{return t.send(null),t.responseText}catch(n){return null}},getResourceUrl:function(e){throw new NotImplementedException}};







function IO(){}var utils=require("kango/utils"),object=utils.object;IO.prototype=object.extend(IOBase,{getExtensionFileUrl:function(e){return chrome.extension.getURL(e)},getResourceUrl:function(e){return this.getExtensionFileUrl(e)}}),module.exports=new IO,module.exports.getPublicApi=getPublicApi;
});