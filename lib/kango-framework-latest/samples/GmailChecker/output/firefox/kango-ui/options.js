function IOptionsPage(){}function getPublicApi(){return utils.createApiWrapper(module.exports,IOptionsPage.prototype)}var utils=require("kango/utils"),NotImplementedException=utils.NotImplementedException;IOptionsPage.prototype={open:function(){throw new NotImplementedException}};







function OptionsPage(){var e=this._optionsUrl=io.getExtensionFileUrl(extensionInfo.options_page).toLowerCase();browser.addEventListener("DocumentLoaded",function(o){0==o.url.toLowerCase().indexOf(e)&&(o.window.__kango_require=require,o.window.__kango_optionsPageMode=!0)})}var extensionInfo=require("kango/extension_info"),utils=require("kango/utils"),browser=require("kango/browser"),io=require("kango/io"),chromeWindows=require("kango/chrome_windows"),array=utils.array;OptionsPage.prototype={dispose:function(){this.close()},open:function(e){if(""!=this._optionsUrl){var o=this._optionsUrl;return"undefined"!=typeof e&&(o+="#"+e),browser.tabs.create({url:o,focused:!0,reuse:!0}),!0}return!1},close:function(){var e=this._optionsUrl;if(""!=e)for(var o=chromeWindows.getMostRecentChromeWindow().gBrowser,r=0;r<o.browsers.length;r++){var n=o.getBrowserAtIndex(r);if(0==n.currentURI.spec.indexOf(e)){o.removeTab(o.tabContainer.childNodes[r]);break}}}},extensionInfo.options_page&&(module.exports=new OptionsPage,module.exports.getPublicApi=getPublicApi);