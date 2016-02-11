"use strict";
_kangoLoader.add("kango-ui/context_menu", function(require, exports, module) {
function ContextMenuItemBase(){EventTarget.call(this)}function getPublicApi(){return utils.createApiWrapper(module.exports,ContextMenuItemBase.prototype,IEventTarget.prototype)}var utils=require("kango/utils"),object=utils.object,EventTarget=utils.EventTarget,IEventTarget=utils.IEventTarget;ContextMenuItemBase.prototype=object.extend(EventTarget,{event:{CLICK:"click"}});







function ContextMenuItem(t){ContextMenuItemBase.apply(this,arguments),this.init(t)}var extensionInfo=require("kango/extension_info"),utils=require("kango/utils"),func=utils.func,object=utils.object;ContextMenuItem.prototype=object.extend(ContextMenuItemBase,{init:function(t){this.addItem("item1",t.caption,t.context||"all")},addItem:function(t,e,n){var i={title:e,contexts:[n]};return i.onclick=func.bind(function(t,e){var n={srcUrl:t.srcUrl,linkUrl:t.linkUrl};this.fireEvent(this.event.CLICK,n)},this),chrome.contextMenus.create(i)}}),extensionInfo.context_menu_item&&(module.exports=new ContextMenuItem(extensionInfo.context_menu_item),module.exports.getPublicApi=getPublicApi);
});