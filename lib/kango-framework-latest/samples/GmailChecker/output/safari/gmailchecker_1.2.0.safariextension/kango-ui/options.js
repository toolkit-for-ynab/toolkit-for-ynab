"use strict";
_kangoLoader.add("kango-ui/options", function(require, exports, module) {
function IOptionsPage(){}function getPublicApi(){return utils.createApiWrapper(module.exports,IOptionsPage.prototype)}var utils=require("kango/utils"),NotImplementedException=utils.NotImplementedException;IOptionsPage.prototype={open:function(){throw new NotImplementedException}};







function OptionsPage(){}var extensionInfo=require("kango/extension_info"),utils=require("kango/utils"),browser=require("kango/browser"),io=require("kango/io"),array=utils.array;OptionsPage.prototype={open:function(e){var o=io.getExtensionFileUrl(extensionInfo.options_page);return"undefined"!=typeof e&&(o+="#"+e),browser.tabs.getAll(function(e){var n=!1;array.forEach(e,function(e){-1!=e.getUrl().indexOf(o)&&(n=!0,e.activate())}),n||browser.tabs.create({url:o,focused:!0})}),!0}},extensionInfo.options_page&&(module.exports=new OptionsPage,module.exports.getPublicApi=getPublicApi);







if(module.exports){var optionsPage=module.exports;safari.extension.settings.addEventListener("change",function(e){"open-options"==e.key&&optionsPage.open()},!1)}
});