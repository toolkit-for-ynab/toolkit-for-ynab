var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var Cm = Components.manager;
var Cr = Components.results;

Cu['import']('resource://gre/modules/Services.jsm');
Cu['import']('resource://gre/modules/AddonManager.jsm');
Cu['import']('resource://gre/modules/FileUtils.jsm');

function log(str) {
    Services.console.logStringMessage(str)
}

var loader = null;

function getExtensionInfo(data) {
    var req = Cc['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Ci.nsIXMLHttpRequest);
    req.open('GET', data.resourceURI.spec + 'extension_info.json', false);
    req.overrideMimeType('text/plain');
    req.send(null);
    return JSON.parse(req.responseText);
}

function Module(id, require, props) {
    this.XMLHttpRequest = function() {
        return Cc['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Ci.nsIXMLHttpRequest);
    };

    this.alert = function(str) {
        Services.prompt.alert(null, 'Kango', str);
    };

    this.log = log;
    this.id = id;
    this.exports = {};
    this.require = require;
    this.module = this;

    this.Services = Services;
    this.FileUtils = FileUtils;

    this.Cc = Cc;
    this.Ci = Ci;
    this.Cu = Cu;
    this.Cm = Cm;
    this.Cr = Cr;

    if (props) {
        for (var key in props) {
            if (props.hasOwnProperty(key)) {
                this[key] = props[key];
            }
        }
    }
}

function Loader(resolvePath, props, overrides) {

    var modules = {};

    function require(id) {
        if (overrides && overrides.hasOwnProperty(id)) {
            return overrides[id];
        }
        if (!modules[id]) {
            var principal = Cc['@mozilla.org/systemprincipal;1'].getService(Ci.nsIPrincipal);
            var module = modules[id] = new Cu.Sandbox(principal, {
                sandboxName: id,
                sandboxPrototype: new Module(id, require, props),
                wantComponents: false,
                wantXrays: false
            });
            var path = resolvePath(id);
            if (path) {
                Services.scriptloader.loadSubScript(path, module, 'UTF-8');
            }
            else {
                throw new Error('Unable to find module with id=' + id)
            }
        }
        return modules[id].exports;
    }

    function dispose() {
        for (var key in modules) {
            if (modules.hasOwnProperty(key)) {
                var module = modules[key];
                if (module.exports.dispose) {
                    module.exports.dispose();
                }
                if (module.dispose) {
                    module.dispose();
                }
            }
        }
        for (var key in modules) {
            if (modules.hasOwnProperty(key)) {
                var module = modules[key];
                for (var k in module) {
                    module[k] = null;
                }
                modules[key] = null;
            }
        }
        modules = {};
    }

    return {
        require: require,
        dispose: dispose
    };
}

function loadServices(loader, info) {
    var modules = [
        'kango/userscript_engine',
        'kango/backgroundscript_engine',
        'kango/api'
    ];

    if (info.modules) {
        modules = modules.concat(info.modules);
    }

    for (var i = 0; i < modules.length; i++) {
        loader.require(modules[i]);
    }
}

function init(startupData) {
    AddonManager.getAddonByID(startupData.id, function(addon) {
        var info = getExtensionInfo(startupData);
        var resolvePath = function(id) {
            var filename = id + '.js';
            if (addon.hasResource(filename)) {
                return addon.getResourceURI(filename).spec;
            }
            return null;
        };
        loader = new Loader(resolvePath, {
            __extensionInfo: info,
            __installPath: startupData.installPath
        });
        loadServices(loader, info);
        loader.require('kango/core').init();
    });
}

// bootstrap.js required exports

function install(data, reason) {
}

function uninstall(data, reason) {
    if (reason == ADDON_UNINSTALL) {
        var resolvePath = function(id) {
            return data.resourceURI.spec + id + '.js';
        };
        var info = getExtensionInfo(data);
        var loader = new Loader(resolvePath, null, {
            'kango/core': {
                addAsyncModule: function(){},
                fireEvent: function(){},
                uninstall: true
            },
            'kango/extension_info': info
        });
        loader.require('kango/uninstall')();
    }
}

function startup(startupData, reason) {
    var hiddenDOMWindow;
    try {
        hiddenDOMWindow = (Services.appShell || Cc['@mozilla.org/appshell/appShellService;1'].getService(Ci.nsIAppShellService)).hiddenDOMWindow;
    }
    catch (e) {
    }
    if (hiddenDOMWindow) {
        init(startupData);
    } else {
        var onFinalUiStartup = function(subject, topic, data) {
            Services.obs.removeObserver(onFinalUiStartup, 'final-ui-startup', false);
            init(startupData);
        };
        Services.obs.addObserver(onFinalUiStartup, 'final-ui-startup', false);
    }
}

function shutdown(data, reason) {
    if (reason != APP_SHUTDOWN) {
        if (loader) {
            loader.dispose();
            loader = null;
        }
    }
}