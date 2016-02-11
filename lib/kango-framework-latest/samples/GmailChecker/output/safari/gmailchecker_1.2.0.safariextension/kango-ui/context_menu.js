"use strict";
_kangoLoader.add("kango-ui/context_menu", function(require, exports, module) {
function ContextMenuItemBase(){EventTarget.call(this)}function getPublicApi(){return utils.createApiWrapper(module.exports,ContextMenuItemBase.prototype,IEventTarget.prototype)}var utils=require("kango/utils"),object=utils.object,EventTarget=utils.EventTarget,IEventTarget=utils.IEventTarget;ContextMenuItemBase.prototype=object.extend(EventTarget,{event:{CLICK:"click"}});







function ContextMenuItem(t){ContextMenuItemBase.apply(this,arguments),this.init(t)}var extensionInfo=require("kango/extension_info"),utils=require("kango/utils"),func=utils.func,object=utils.object;ContextMenuItem.prototype=object.extend(ContextMenuItemBase,{init:function(t){this.addItem("item1",t.caption,t.context||"all")},addItem:function(t,e,n){safari.application.addEventListener("contextmenu",func.bind(function(n){n.contextMenu.appendContextMenuItem(t,e)},this),!1),safari.application.addEventListener("command",func.bind(function(e){e.command==t&&this.fireEvent(this.event.CLICK)},this),!1)}}),extensionInfo.context_menu_item&&(module.exports=new ContextMenuItem(extensionInfo.context_menu_item),module.exports.getPublicApi=getPublicApi);
});