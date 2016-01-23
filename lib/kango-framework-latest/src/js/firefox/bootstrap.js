Components.utils['import']('resource://gre/modules/Services.jsm');
Components.utils['import']('resource://gre/modules/FileUtils.jsm');
Components.utils['import']('resource://gre/modules/AddonManager.jsm');

var gLoader;
var gLoaderPath;

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
        var resolvePath = function(id) {
            var filename = id + '.js';
            if (addon.hasResource(filename)) {
                return addon.getResourceURI(filename).spec;
            }
            return null;
        };
        gLoaderPath = resolvePath('kango/loader');
        Components.utils['import'](gLoaderPath);
        var info = loadExtensionInfo(function(name) {
            return startupData.resourceURI.spec + name;
        });
        gLoader = new Loader(resolvePath, {
            __extensionInfo: info,
            __installPath: startupData.installPath
        });
        loadServices(gLoader, info);
        gLoader.require('kango/core').init();
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
        var loaderPath = resolvePath('kango/loader');
        Cu['import'](loaderPath);
        var info = loadExtensionInfo(function(name) {
            return data.resourceURI.spec + name;
        });
        var loader = new Loader(resolvePath, null, {
            'kango/core': {
                addAsyncModule: function(){},
                fireEvent: function(){},
                uninstall: true
            },
            'kango/extension_info': info
        });
        loader.require('kango/uninstall')();
        Cu.unload(loaderPath);
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
        if (gLoader) {
            gLoader.dispose();
            gLoader = null;
            Cu.unload(gLoaderPath);
        }
    }
}