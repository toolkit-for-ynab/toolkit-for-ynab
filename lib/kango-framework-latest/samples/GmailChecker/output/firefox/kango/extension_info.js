function ExtensionInfo(t){this.getRawData=function(){return object.clone(t)},this.update=function(i){object.mixin(t,i),object.mixin(this,i)},this.name="",this.version="",this.description="",this.creator="",this.homepage_url="",this.background_scripts=[],this.content_scripts=[],this.browser_button=null,this.update_path_url="",this.options_page="",this.context_menu_item=null,this.default_locale="",this.permissions={},this.debug=!1,this.modules=[],this.settings={},object.mixin(this,t)}var utils=require("kango/utils"),object=utils.object;







module.exports=new ExtensionInfo(__extensionInfo);