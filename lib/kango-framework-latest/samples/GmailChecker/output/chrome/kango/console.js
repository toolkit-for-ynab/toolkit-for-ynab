"use strict";
_kangoLoader.add("kango/console", function(require, exports, module) {
function IConsole(){}function getPublicApi(){return utils.createApiWrapper(module.exports,IConsole.prototype)}var utils=require("kango/utils"),NotImplementedException=utils.NotImplementedException;IConsole.prototype={log:function(e,t){throw new NotImplementedException},warn:function(e,t){throw new NotImplementedException},error:function(e,t){throw new NotImplementedException}};







function Console(){}var utils=require("kango/utils"),string=utils.string;Console.prototype={log:function(n){arguments.length>1&&(n=string.format.apply(string,arguments)),console.log(n)},warn:function(n){arguments.length>1&&(n=string.format.apply(string,arguments)),console.warn(n)},error:function(n){arguments.length>1&&(n=string.format.apply(string,arguments)),console.error(n)},reportError:function(n,r){this.warn("Error in script "+(r||"(unknown)")+": "+n.message),this.warn(n.stack||"(No stack trace available)")}},module.exports=new Console,module.exports.getPublicApi=getPublicApi;
});