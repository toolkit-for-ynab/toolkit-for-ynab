!function(n){function e(){var n=[],e=!1;this.onReady=function(i){e?i():n.push(i)},this.closeWindow=function(){},this.resizeWindow=function(n,e){},this.getBackgroundPage=function(){},this._fireReady=function(){var o=KangoAPI.getBackgroundPage();if(o){var t=KangoAPI._require("kango/utils").object;t.forEach(i(KangoAPI._require),function(n,e){window[e]=n})}for(var a=0;a<n.length;a++)n[a]();e=!0,delete this._fireReady,delete this._require,t&&t.freeze(this)}}var i=function(n){var e=n("kango/core").createApiInstance("popup");return"undefined"!=typeof window.addEventListener?window.addEventListener("unload",function(){e.clear()},!1):window.attachEvent("onunload",function(){e.clear()}),e.obj};n.KangoAPI=new e}(window);







window.addEventListener("DOMContentLoaded",function(){var n=chrome.extension.getBackgroundPage()._kangoLoader.require;KangoAPI.getBackgroundPage=function(){return chrome.extension.getBackgroundPage()},KangoAPI.closeWindow=function(){window.close()},KangoAPI._require=function(e){return n(e)},KangoAPI._fireReady()},!1);