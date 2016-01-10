"use strict";
_kangoLoader.add("kango/lang", function(require, exports, module) {
function LangBase(){}var NotImplementedException=require("kango/utils").NotImplementedException;LangBase.prototype={evalInSandbox:function(e,n){throw new NotImplementedException},evalScriptsInSandbox:function(e,n){for(var t="",o=0;o<n.length;o++){for(var r=0;r<n[o].requires.length;r++)t+=n[o].requires[r].text+"\n\n";t+=n[o].text+"\n\n"}return this.evalInSandbox(e,t)}};







function Lang(){}var object=require("kango/utils").object;Lang.prototype=object.extend(LangBase,{createHTMLSandbox:function(e,n){return n(window)}}),module.exports=new Lang;
});