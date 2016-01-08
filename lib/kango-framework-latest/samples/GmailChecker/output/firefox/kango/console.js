function IConsole(){}function getPublicApi(){return utils.createApiWrapper(module.exports,IConsole.prototype)}var utils=require("kango/utils"),NotImplementedException=utils.NotImplementedException;IConsole.prototype={log:function(e,t){throw new NotImplementedException},warn:function(e,t){throw new NotImplementedException},error:function(e,t){throw new NotImplementedException}};







function Console(){}var utils=require("kango/utils"),string=utils.string;Console.prototype={_logMessage:function(e,r){var n=e.length>1?string.format.apply(string,e):e[0],o=Cc["@mozilla.org/scripterror;1"].createInstance(Ci.nsIScriptError);o.init(n,null,null,null,null,r,null),Services.console.logMessage(o)},log:function(e){arguments.length>1&&(e=string.format.apply(string,arguments)),Services.console.logStringMessage(e)},warn:function(e){this._logMessage(arguments,1)},error:function(e){this._logMessage(arguments,0)},reportError:function(e,r){var n=Cc["@mozilla.org/scripterror;1"].createInstance(Ci.nsIScriptError);n.init(e.message,r||e.fileName,null,e.lineNumber,e.columnNumber,0,null),Services.console.logMessage(n)}},module.exports=new Console,module.exports.getPublicApi=getPublicApi;