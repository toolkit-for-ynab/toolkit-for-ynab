"use strict";
_kangoLoader.add("kango/extension_info", function(require, exports, module) {
function ExtensionInfo(t){this.getRawData=function(){return object.clone(t)},this.update=function(i){object.mixin(t,i),object.mixin(this,i)},this.name="",this.version="",this.description="",this.creator="",this.homepage_url="",this.background_scripts=[],this.content_scripts=[],this.browser_button=null,this.update_path_url="",this.options_page="",this.context_menu_item=null,this.default_locale="",this.permissions={},this.debug=!1,this.modules=[],this.settings={},object.mixin(this,t)}var utils=require("kango/utils"),object=utils.object;







var getExtensionInfo=function(){var e=new XMLHttpRequest;return e.open("GET",chrome.extension.getURL("extension_info.json"),!1),e.overrideMimeType("text/plain"),e.send(null),JSON.parse(e.responseText)};module.exports=new ExtensionInfo(getExtensionInfo());
});