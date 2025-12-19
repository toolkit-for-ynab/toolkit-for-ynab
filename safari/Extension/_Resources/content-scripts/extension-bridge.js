/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ 10: /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ getBrowser: () => /* binding */ getBrowser,
        /* harmony export */ getBrowserName: () => /* binding */ getBrowserName,
        /* harmony export */ getEnvironment: () => /* binding */ getEnvironment,
        /* harmony export */ isSafariBrowser: () => /* binding */ isSafariBrowser,
        /* harmony export */
      });
      /* harmony import */ var core_js_modules_es7_array_includes_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(11);
      /* harmony import */ var core_js_modules_es7_array_includes_js__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(
          core_js_modules_es7_array_includes_js__WEBPACK_IMPORTED_MODULE_0__,
        );
      /* harmony import */ var toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(43);

      const getBrowser = () => {
        if (typeof browser !== 'undefined') {
          return browser;
        }
        if (typeof chrome !== 'undefined') {
          return chrome;
        }
      };
      function getBrowserName() {
        const _browser = getBrowser(); // browser is global so use _ to namespace
        const URL = _browser.runtime.getURL('');
        if (
          URL.startsWith(
            toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.BrowserExtensionPrefix[
              toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Chrome
            ],
          )
        ) {
          return toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Chrome;
        }
        if (
          URL.startsWith(
            toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.BrowserExtensionPrefix[
              toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Firefox
            ],
          )
        ) {
          return toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Firefox;
        }
        if (
          URL.startsWith(
            toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.BrowserExtensionPrefix[
              toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Edge
            ],
          )
        ) {
          return toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Edge;
        }
        if (
          URL.startsWith(
            toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.BrowserExtensionPrefix[
              toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Safari
            ],
          )
        ) {
          return toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Safari;
        }
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        if (isSafariBrowser(userAgent)) {
          return toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Browser.Safari;
        }
        return '';
      }
      function isSafariBrowser(userAgent = '') {
        if (!userAgent && typeof navigator !== 'undefined') {
          userAgent = navigator.userAgent;
        }
        if (!userAgent) {
          return false;
        }
        const isSafari =
          userAgent.includes('Safari') && !userAgent.match(/Chrome|Chromium|Edg|OPR/);
        return Boolean(isSafari);
      }
      function getEnvironment() {
        const _browser = getBrowser(); // browser is global so use _ to namespace
        const extensionId = _browser.runtime.id;
        const environment =
          toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.ExtensionIdEnvironmentMap[
            extensionId
          ];
        return (
          environment ||
          toolkit_core_common_constants__WEBPACK_IMPORTED_MODULE_1__.Environment.Development
        );
      }

      /***/
    },

    /***/ 32: /***/ (module) => {
      module.exports = function (it) {
        if (typeof it != 'function') throw TypeError(it + ' is not a function!');
        return it;
      };

      /***/
    },

    /***/ 41: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // 22.1.3.31 Array.prototype[@@unscopables]
      var UNSCOPABLES = __webpack_require__(42)('unscopables');
      var ArrayProto = Array.prototype;
      if (ArrayProto[UNSCOPABLES] == undefined)
        __webpack_require__(15)(ArrayProto, UNSCOPABLES, {});
      module.exports = function (key) {
        ArrayProto[UNSCOPABLES][key] = true;
      };

      /***/
    },

    /***/ 17: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var isObject = __webpack_require__(18);
      module.exports = function (it) {
        if (!isObject(it)) throw TypeError(it + ' is not an object!');
        return it;
      };

      /***/
    },

    /***/ 33: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // false -> Array#indexOf
      // true  -> Array#includes
      var toIObject = __webpack_require__(34);
      var toLength = __webpack_require__(38);
      var toAbsoluteIndex = __webpack_require__(40);
      module.exports = function (IS_INCLUDES) {
        return function ($this, el, fromIndex) {
          var O = toIObject($this);
          var length = toLength(O.length);
          var index = toAbsoluteIndex(fromIndex, length);
          var value;
          // Array#includes uses SameValueZero equality algorithm
          // eslint-disable-next-line no-self-compare
          if (IS_INCLUDES && el != el)
            while (length > index) {
              value = O[index++];
              // eslint-disable-next-line no-self-compare
              if (value != value) return true;
              // Array#indexOf ignores holes, Array#includes - not
            }
          else
            for (; length > index; index++)
              if (IS_INCLUDES || index in O) {
                if (O[index] === el) return IS_INCLUDES || index || 0;
              }
          return !IS_INCLUDES && -1;
        };
      };

      /***/
    },

    /***/ 36: /***/ (module) => {
      var toString = {}.toString;

      module.exports = function (it) {
        return toString.call(it).slice(8, -1);
      };

      /***/
    },

    /***/ 14: /***/ (module) => {
      var core = (module.exports = { version: '2.6.9' });
      if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

      /***/
    },

    /***/ 31: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // optional / simple context binding
      var aFunction = __webpack_require__(32);
      module.exports = function (fn, that, length) {
        aFunction(fn);
        if (that === undefined) return fn;
        switch (length) {
          case 1:
            return function (a) {
              return fn.call(that, a);
            };
          case 2:
            return function (a, b) {
              return fn.call(that, a, b);
            };
          case 3:
            return function (a, b, c) {
              return fn.call(that, a, b, c);
            };
        }
        return function (/* ...args */) {
          return fn.apply(that, arguments);
        };
      };

      /***/
    },

    /***/ 37: /***/ (module) => {
      // 7.2.1 RequireObjectCoercible(argument)
      module.exports = function (it) {
        if (it == undefined) throw TypeError("Can't call method on  " + it);
        return it;
      };

      /***/
    },

    /***/ 20: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // Thank's IE8 for his funny defineProperty
      module.exports = !__webpack_require__(21)(function () {
        return (
          Object.defineProperty({}, 'a', {
            get: function () {
              return 7;
            },
          }).a != 7
        );
      });

      /***/
    },

    /***/ 22: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var isObject = __webpack_require__(18);
      var document = __webpack_require__(13).document;
      // typeof document.createElement is 'object' in old IE
      var is = isObject(document) && isObject(document.createElement);
      module.exports = function (it) {
        return is ? document.createElement(it) : {};
      };

      /***/
    },

    /***/ 12: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var global = __webpack_require__(13);
      var core = __webpack_require__(14);
      var hide = __webpack_require__(15);
      var redefine = __webpack_require__(25);
      var ctx = __webpack_require__(31);
      var PROTOTYPE = 'prototype';

      var $export = function (type, name, source) {
        var IS_FORCED = type & $export.F;
        var IS_GLOBAL = type & $export.G;
        var IS_STATIC = type & $export.S;
        var IS_PROTO = type & $export.P;
        var IS_BIND = type & $export.B;
        var target = IS_GLOBAL
          ? global
          : IS_STATIC
          ? global[name] || (global[name] = {})
          : (global[name] || {})[PROTOTYPE];
        var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
        var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
        var key, own, out, exp;
        if (IS_GLOBAL) source = name;
        for (key in source) {
          // contains in native
          own = !IS_FORCED && target && target[key] !== undefined;
          // export native or passed
          out = (own ? target : source)[key];
          // bind timers to global for call from export context
          exp =
            IS_BIND && own
              ? ctx(out, global)
              : IS_PROTO && typeof out == 'function'
              ? ctx(Function.call, out)
              : out;
          // extend global
          if (target) redefine(target, key, out, type & $export.U);
          // export
          if (exports[key] != out) hide(exports, key, exp);
          if (IS_PROTO && expProto[key] != out) expProto[key] = out;
        }
      };
      global.core = core;
      // type bitmap
      $export.F = 1; // forced
      $export.G = 2; // global
      $export.S = 4; // static
      $export.P = 8; // proto
      $export.B = 16; // bind
      $export.W = 32; // wrap
      $export.U = 64; // safe
      $export.R = 128; // real proto method for `library`
      module.exports = $export;

      /***/
    },

    /***/ 21: /***/ (module) => {
      module.exports = function (exec) {
        try {
          return !!exec();
        } catch (e) {
          return true;
        }
      };

      /***/
    },

    /***/ 28: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      module.exports = __webpack_require__(29)('native-function-to-string', Function.toString);

      /***/
    },

    /***/ 13: /***/ (module) => {
      // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
      var global = (module.exports =
        typeof window != 'undefined' && window.Math == Math
          ? window
          : typeof self != 'undefined' && self.Math == Math
          ? self
          : // eslint-disable-next-line no-new-func
            Function('return this')());
      if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

      /***/
    },

    /***/ 26: /***/ (module) => {
      var hasOwnProperty = {}.hasOwnProperty;
      module.exports = function (it, key) {
        return hasOwnProperty.call(it, key);
      };

      /***/
    },

    /***/ 15: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var dP = __webpack_require__(16);
      var createDesc = __webpack_require__(24);
      module.exports = __webpack_require__(20)
        ? function (object, key, value) {
            return dP.f(object, key, createDesc(1, value));
          }
        : function (object, key, value) {
            object[key] = value;
            return object;
          };

      /***/
    },

    /***/ 19: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      module.exports =
        !__webpack_require__(20) &&
        !__webpack_require__(21)(function () {
          return (
            Object.defineProperty(__webpack_require__(22)('div'), 'a', {
              get: function () {
                return 7;
              },
            }).a != 7
          );
        });

      /***/
    },

    /***/ 35: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // fallback for non-array-like ES3 and non-enumerable old V8 strings
      var cof = __webpack_require__(36);
      // eslint-disable-next-line no-prototype-builtins
      module.exports = Object('z').propertyIsEnumerable(0)
        ? Object
        : function (it) {
            return cof(it) == 'String' ? it.split('') : Object(it);
          };

      /***/
    },

    /***/ 18: /***/ (module) => {
      module.exports = function (it) {
        return typeof it === 'object' ? it !== null : typeof it === 'function';
      };

      /***/
    },

    /***/ 30: /***/ (module) => {
      module.exports = false;

      /***/
    },

    /***/ 16: /***/ (__unused_webpack_module, exports, __webpack_require__) => {
      var anObject = __webpack_require__(17);
      var IE8_DOM_DEFINE = __webpack_require__(19);
      var toPrimitive = __webpack_require__(23);
      var dP = Object.defineProperty;

      exports.f = __webpack_require__(20)
        ? Object.defineProperty
        : function defineProperty(O, P, Attributes) {
            anObject(O);
            P = toPrimitive(P, true);
            anObject(Attributes);
            if (IE8_DOM_DEFINE)
              try {
                return dP(O, P, Attributes);
              } catch (e) {
                /* empty */
              }
            if ('get' in Attributes || 'set' in Attributes)
              throw TypeError('Accessors not supported!');
            if ('value' in Attributes) O[P] = Attributes.value;
            return O;
          };

      /***/
    },

    /***/ 24: /***/ (module) => {
      module.exports = function (bitmap, value) {
        return {
          enumerable: !(bitmap & 1),
          configurable: !(bitmap & 2),
          writable: !(bitmap & 4),
          value: value,
        };
      };

      /***/
    },

    /***/ 25: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var global = __webpack_require__(13);
      var hide = __webpack_require__(15);
      var has = __webpack_require__(26);
      var SRC = __webpack_require__(27)('src');
      var $toString = __webpack_require__(28);
      var TO_STRING = 'toString';
      var TPL = ('' + $toString).split(TO_STRING);

      __webpack_require__(14).inspectSource = function (it) {
        return $toString.call(it);
      };

      (module.exports = function (O, key, val, safe) {
        var isFunction = typeof val == 'function';
        if (isFunction) has(val, 'name') || hide(val, 'name', key);
        if (O[key] === val) return;
        if (isFunction)
          has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
        if (O === global) {
          O[key] = val;
        } else if (!safe) {
          delete O[key];
          hide(O, key, val);
        } else if (O[key]) {
          O[key] = val;
        } else {
          hide(O, key, val);
        }
        // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
      })(Function.prototype, TO_STRING, function toString() {
        return (typeof this == 'function' && this[SRC]) || $toString.call(this);
      });

      /***/
    },

    /***/ 29: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var core = __webpack_require__(14);
      var global = __webpack_require__(13);
      var SHARED = '__core-js_shared__';
      var store = global[SHARED] || (global[SHARED] = {});

      (module.exports = function (key, value) {
        return store[key] || (store[key] = value !== undefined ? value : {});
      })('versions', []).push({
        version: core.version,
        mode: __webpack_require__(30) ? 'pure' : 'global',
        copyright: '© 2019 Denis Pushkarev (zloirock.ru)',
      });

      /***/
    },

    /***/ 40: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var toInteger = __webpack_require__(39);
      var max = Math.max;
      var min = Math.min;
      module.exports = function (index, length) {
        index = toInteger(index);
        return index < 0 ? max(index + length, 0) : min(index, length);
      };

      /***/
    },

    /***/ 39: /***/ (module) => {
      // 7.1.4 ToInteger
      var ceil = Math.ceil;
      var floor = Math.floor;
      module.exports = function (it) {
        return isNaN((it = +it)) ? 0 : (it > 0 ? floor : ceil)(it);
      };

      /***/
    },

    /***/ 34: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // to indexed object, toObject with fallback for non-array-like ES3 strings
      var IObject = __webpack_require__(35);
      var defined = __webpack_require__(37);
      module.exports = function (it) {
        return IObject(defined(it));
      };

      /***/
    },

    /***/ 38: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // 7.1.15 ToLength
      var toInteger = __webpack_require__(39);
      var min = Math.min;
      module.exports = function (it) {
        return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
      };

      /***/
    },

    /***/ 23: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // 7.1.1 ToPrimitive(input [, PreferredType])
      var isObject = __webpack_require__(18);
      // instead of the ES6 spec version, we didn't implement @@toPrimitive case
      // and the second argument - flag - preferred type is a string
      module.exports = function (it, S) {
        if (!isObject(it)) return it;
        var fn, val;
        if (S && typeof (fn = it.toString) == 'function' && !isObject((val = fn.call(it))))
          return val;
        if (typeof (fn = it.valueOf) == 'function' && !isObject((val = fn.call(it)))) return val;
        if (!S && typeof (fn = it.toString) == 'function' && !isObject((val = fn.call(it))))
          return val;
        throw TypeError("Can't convert object to primitive value");
      };

      /***/
    },

    /***/ 27: /***/ (module) => {
      var id = 0;
      var px = Math.random();
      module.exports = function (key) {
        return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
      };

      /***/
    },

    /***/ 42: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var store = __webpack_require__(29)('wks');
      var uid = __webpack_require__(27);
      var Symbol = __webpack_require__(13).Symbol;
      var USE_SYMBOL = typeof Symbol == 'function';

      var $exports = (module.exports = function (name) {
        return (
          store[name] ||
          (store[name] =
            (USE_SYMBOL && Symbol[name]) || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name))
        );
      });

      $exports.store = store;

      /***/
    },

    /***/ 11: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
      'use strict';

      // https://github.com/tc39/Array.prototype.includes
      var $export = __webpack_require__(12);
      var $includes = __webpack_require__(33)(true);

      $export($export.P, 'Array', {
        includes: function includes(el /* , fromIndex = 0 */) {
          return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
        },
      });

      __webpack_require__(41)('includes');

      /***/
    },

    /***/ 43: /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Browser: () => /* binding */ Browser,
        /* harmony export */ BrowserExtensionPrefix: () => /* binding */ BrowserExtensionPrefix,
        /* harmony export */ Environment: () => /* binding */ Environment,
        /* harmony export */ ExtensionIdEnvironmentMap: () =>
          /* binding */ ExtensionIdEnvironmentMap,
        /* harmony export */ ExtensionIds: () => /* binding */ ExtensionIds,
        /* harmony export */
      });
      var Browser;
      (function (Browser) {
        Browser['Chrome'] = 'chrome';
        Browser['Edge'] = 'edge';
        Browser['Firefox'] = 'firefox';
        Browser['Safari'] = 'safari';
      })(Browser || (Browser = {}));
      const BrowserExtensionPrefix = {
        [Browser.Chrome]: 'chrome-extension://',
        [Browser.Edge]: 'ms-browser-extension://',
        [Browser.Firefox]: 'moz-extension://',
        [Browser.Safari]: 'safari-web-extension://',
      };
      var Environment;
      (function (Environment) {
        Environment['Beta'] = 'beta';
        Environment['Development'] = 'development';
        Environment['Production'] = 'production';
      })(Environment || (Environment = {}));
      const ExtensionIds = {
        ChromeBeta: 'mkgdgjnaaejddflnldinkilabeglghlo',
        ChromeProduction: 'lmhdkkhepllpnondndgpgclfjnlofgjl',
        FirefoxProduction: '{4F1FB113-D7D8-40AE-A5BA-9300EAEA0F51}',
      };
      const ExtensionIdEnvironmentMap = {
        [ExtensionIds.ChromeBeta]: Environment.Beta,
        [ExtensionIds.ChromeProduction]: Environment.Production,
        [ExtensionIds.FirefoxProduction]: Environment.Production,
      };

      /***/
    },

    /***/ 44: /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ FEATURE_SETTING_PREFIX: () => /* binding */ FEATURE_SETTING_PREFIX,
        /* harmony export */ StorageArea: () => /* binding */ StorageArea,
        /* harmony export */ ToolkitStorage: () => /* binding */ ToolkitStorage,
        /* harmony export */ featureSettingKey: () => /* binding */ featureSettingKey,
        /* harmony export */ localToolkitStorage: () => /* binding */ localToolkitStorage,
        /* harmony export */
      });
      /* harmony import */ var toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(10);

      const FEATURE_SETTING_PREFIX = 'toolkit-feature:';
      const featureSettingKey = (featureName) => `${FEATURE_SETTING_PREFIX}${featureName}`;
      var StorageArea;
      (function (StorageArea) {
        StorageArea['Local'] = 'local';
      })(StorageArea || (StorageArea = {}));
      class ToolkitStorage {
        constructor(storageArea = StorageArea.Local) {
          this.browser = (0,
          toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getBrowser)();
          this.storageArea = StorageArea.Local;
          this.storageListeners = new Map();
          this._listenForChanges = (changes, areaName) => {
            if (areaName !== this.storageArea) return;
            for (const [key, value] of Object.entries(changes)) {
              if (this.storageListeners.has(key)) {
                const listeners = this.storageListeners.get(key);
                listeners.forEach((listener) => {
                  listener(key, value.newValue);
                });
              }
            }
          };
          if (storageArea) {
            this.storageArea = storageArea;
          }
          this.browser.storage.onChanged.addListener(this._listenForChanges);
        }
        // many features have been built with the assumption that settings come back
        // as strings and it's just easier to maintain that assumption rather than update
        // those features. so override options with parse: false when getting feature settings
        getFeatureSetting(settingName, options = {}) {
          const getFeatureSettingOptions = {
            parse: false,
            ...options,
          };
          return this.getStorageItem(featureSettingKey(settingName), getFeatureSettingOptions);
        }
        getFeatureSettings(settingNames, options = {}) {
          const getFeatureSettingsOptions = {
            parse: false,
            ...options,
          };
          return Promise.all(
            settingNames.map((settingName) => {
              return this.getStorageItem(featureSettingKey(settingName), getFeatureSettingsOptions);
            }),
          );
        }
        setFeatureSetting(settingName, value, options = {}) {
          return this.setStorageItem(featureSettingKey(settingName), value, options);
        }
        removeFeatureSetting(settingName, options = {}) {
          return this.removeStorageItem(featureSettingKey(settingName), options);
        }
        getStorageItem(itemKey, options = {}) {
          return this._get(itemKey, options).then((value) => {
            if (typeof value === 'undefined' && typeof options.default !== 'undefined') {
              return options.default;
            }
            return value;
          });
        }
        removeStorageItem(itemKey, options = {}) {
          return this._remove(itemKey, options);
        }
        setStorageItem(itemKey, itemData, options = {}) {
          return this._set(itemKey, itemData, options);
        }
        getStoredFeatureSettings(options = {}) {
          return this._get(null, options).then((allStorage) => {
            const storedSettings = [];
            for (const [key] of Object.entries(allStorage)) {
              if (key.startsWith(FEATURE_SETTING_PREFIX)) {
                storedSettings.push(key.replace(FEATURE_SETTING_PREFIX, ''));
              }
            }
            return storedSettings;
          });
        }
        onStorageItemChanged(storageKey, callback) {
          if (this.storageListeners.has(storageKey)) {
            const listeners = this.storageListeners.get(storageKey);
            this.storageListeners.set(storageKey, [...listeners, callback]);
          } else {
            this.storageListeners.set(storageKey, [callback]);
          }
        }
        offStorageItemChanged(storageKey, callback) {
          if (this.storageListeners.has(storageKey)) {
            const listeners = this.storageListeners.get(storageKey);
            this.storageListeners.set(
              storageKey,
              listeners.filter((listener) => listener !== callback),
            );
          }
        }
        onFeatureSettingChanged(settingName, callback) {
          this.onStorageItemChanged(featureSettingKey(settingName), callback);
        }
        offFeatureSettingChanged(settingName, callback) {
          this.offStorageItemChanged(featureSettingKey(settingName), callback);
        }
        onToolkitDisabledChanged(callback) {
          this.onStorageItemChanged(featureSettingKey('DisableToolkit'), callback);
        }
        offToolkitDisabledChanged(callback) {
          this.offStorageItemChanged(featureSettingKey('DisableToolkit'), callback);
        }
        _get(key, options) {
          const getOptions = {
            parse: true,
            storageArea: this.storageArea,
            ...options,
          };
          return new Promise((resolve, reject) => {
            try {
              this.browser.storage[getOptions.storageArea].get(key, (data) => {
                // if we're fetching everything -- don't try parsing it
                if (key === null) {
                  return resolve(data);
                }
                try {
                  if (getOptions.parse) {
                    return resolve(JSON.parse(data[key]));
                  } else {
                    return resolve(data[key]);
                  }
                } catch (_ignore) {
                  return resolve(data[key]);
                }
              });
            } catch (e) {
              return reject(e);
            }
          });
        }
        _remove(key, options) {
          const storageArea = options.storageArea || this.storageArea;
          return new Promise((resolve, reject) => {
            try {
              this.browser.storage[storageArea].remove(key, resolve);
            } catch (e) {
              reject(e);
            }
          });
        }
        _set(key, value, options) {
          const storageArea = options.storageArea || this.storageArea;
          return new Promise((resolve, reject) => {
            try {
              const update = { [key]: value };
              this.browser.storage[storageArea].set(update, resolve);
            } catch (e) {
              reject(e);
            }
          });
        }
      }
      const localToolkitStorage = new ToolkitStorage(StorageArea.Local);

      /***/
    },

    /***/ 447: /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ InboundMessageType: () => /* binding */ InboundMessageType,
        /* harmony export */ OutboundMessageType: () => /* binding */ OutboundMessageType,
        /* harmony export */
      });
      var InboundMessageType;
      (function (InboundMessageType) {
        InboundMessageType['Bootstrap'] = 'tk-bootstrap';
        InboundMessageType['SettingChanged'] = 'tk-setting-changed';
      })(InboundMessageType || (InboundMessageType = {}));
      var OutboundMessageType;
      (function (OutboundMessageType) {
        OutboundMessageType['ToolkitLoaded'] = 'tk-loaded';
      })(OutboundMessageType || (OutboundMessageType = {}));

      /***/
    },

    /***/ 57: /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ allToolkitSettings: () =>
          /* reexport safe */ _settings__WEBPACK_IMPORTED_MODULE_0__.allToolkitSettings,
        /* harmony export */ getUserSettings: () => /* binding */ getUserSettings,
        /* harmony export */ settingMigrationMap: () =>
          /* reexport safe */ _settings__WEBPACK_IMPORTED_MODULE_0__.settingMigrationMap,
        /* harmony export */ settingsMap: () =>
          /* reexport safe */ _settings__WEBPACK_IMPORTED_MODULE_0__.settingsMap,
        /* harmony export */
      });
      /* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(58);
      /* harmony import */ var toolkit_core_common_storage__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(44);

      const storage = new toolkit_core_common_storage__WEBPACK_IMPORTED_MODULE_1__.ToolkitStorage();
      function ensureSettingIsValid(name, value) {
        let validValue = value;
        if (value === 'true' || value === 'false') {
          validValue = JSON.parse(value);
          return storage.setFeatureSetting(name, JSON.parse(value));
        }
        return validValue;
      }
      function getUserSettings() {
        return storage.getStoredFeatureSettings().then((storedFeatureSettings) => {
          const settingPromises = _settings__WEBPACK_IMPORTED_MODULE_0__.allToolkitSettings.map(
            (setting) => {
              const settingIsPersisted = storedFeatureSettings.includes(setting.name);
              if (settingIsPersisted) {
                return storage
                  .getFeatureSetting(setting.name)
                  .then((persistedValue) => ensureSettingIsValid(setting.name, persistedValue));
              }
              const migrationSetting =
                _settings__WEBPACK_IMPORTED_MODULE_0__.settingMigrationMap[setting.name];
              if (
                migrationSetting &&
                storedFeatureSettings.includes(migrationSetting.oldSettingName)
              ) {
                const { oldSettingName, settingMapping } = migrationSetting;
                return storage.getFeatureSetting(oldSettingName).then((oldPersistedValue) => {
                  let newSetting = oldPersistedValue;
                  if (settingMapping) {
                    newSetting = settingMapping[oldPersistedValue];
                  }
                  return storage
                    .setFeatureSetting(setting.name, newSetting)
                    .then(() => ensureSettingIsValid(setting.name, newSetting));
                });
              }
              return storage
                .setFeatureSetting(setting.name, setting.default)
                .then(() => storage.getFeatureSetting(setting.name));
            },
          );
          return Promise.all(settingPromises).then((persistedSettings) => {
            const userSettings = _settings__WEBPACK_IMPORTED_MODULE_0__.allToolkitSettings.reduce(
              (allSettings, currentSetting, index) => {
                allSettings[currentSetting.name] = persistedSettings[index];
                return allSettings;
              },
              {},
            );
            return userSettings;
          });
        });
      }

      /***/
    },

    /***/ 58: /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ allToolkitSettings: () => /* binding */ allToolkitSettings,
        /* harmony export */ settingMigrationMap: () => /* binding */ settingMigrationMap,
        /* harmony export */ settingsMap: () => /* binding */ settingsMap,
        /* harmony export */
      });
      if (typeof window.ynabToolKit === 'undefined') {
        window.ynabToolKit = {};
      }
      const settingsMap = {
        AutoEnableRunningBalance: {
          name: 'AutoEnableRunningBalance',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Automatically Enable Running Balance',
          description:
            'Enables YNAB\'s native "Running Balance" by default for each account register.',
        },
        AutomaticallyMarkAsCleared: {
          name: 'AutomaticallyMarkAsCleared',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Automatically Mark Transaction as Cleared',
          description: 'Automatically mark transaction as cleared when you enter it manually.',
        },
        BottomNotificationBar: {
          name: 'BottomNotificationBar',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Bottom Notification Bar',
          description:
            'Move the notification bar to the bottom as an overlay preventing transactions from "jumping around."',
        },
        BulkEditMemo: {
          name: 'BulkEditMemo',
          type: 'checkbox',
          default: true,
          section: 'accounts',
          title: 'Bulk Edit Memos',
          description:
            'Add an option to the "Edit Transaction(s)" menu to "Edit Memo(s)" for all selected transactions. Allows adding a prefix or a suffix to selected memos.',
        },
        BulkManagePayees: {
          name: 'BulkManagePayees',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Bulk Edit Payees',
          description:
            'Add an option to the "Edit Transaction(s)" menu to "Manage Payee(s)" for all selected transactions.',
        },
        CalculateIRR: {
          name: 'CalculateIRR',
          type: 'select',
          default: false,
          section: 'accounts',
          title: 'Calculate Internal Rate of Return',
          description:
            'Calculate Internal Rate of Return for Tracking Accounts. Set Tracking Account contributions to this color to calculate IRR',
          options: [
            {
              name: 'Red',
              value: 'Red',
            },
            {
              name: 'Orange',
              value: 'Orange',
            },
            {
              name: 'Yellow',
              value: 'Yellow',
            },
            {
              name: 'Green',
              value: 'Green',
            },
            {
              name: 'Blue',
              value: 'Blue',
            },
            {
              name: 'Purple',
              value: 'Purple',
            },
          ],
        },
        CalendarFirstDay: {
          name: 'CalendarFirstDay',
          type: 'select',
          default: false,
          section: 'accounts',
          title: 'Modify First Day of the Week',
          description:
            'Adjust the first day of the week in the calendar to whichever day you chose when editing or adding a transaction.',
          options: [
            {
              name: 'Monday',
              value: '1',
            },
            {
              name: 'Tuesday',
              value: '2',
            },
            {
              name: 'Wednesday',
              value: '3',
            },
            {
              name: 'Thursday',
              value: '4',
            },
            {
              name: 'Friday',
              value: '5',
            },
            {
              name: 'Saturday',
              value: '6',
            },
          ],
        },
        ChangeEnterBehavior: {
          name: 'ChangeEnterBehavior',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Save Transaction on Enter',
          description:
            'Change the default action of pressing "Enter" to save a transaction rather than "Save and add another".',
        },
        ChangeMemoEnterBehavior: {
          name: 'ChangeMemoEnterBehavior',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Override Memo Enter Behavior',
          description:
            'Change the default action of pressing "Enter" while in a transaction\'s memo field from saving the transaction to moving to the next field.',
        },
        CompactAccountHeader: {
          name: 'CompactAccountHeader',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Compact Account Header',
          description:
            'Compact the account header. Something reminescent of the old-style account headers.',
        },
        ConfirmEditTransactionCancellation: {
          name: 'ConfirmEditTransactionCancellation',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Confirm Transaction Edit Cancellation',
          description:
            'Display a confirmation prompt when transaction cancelling a transaction edit by pressing "Enter" guarding against accidentely discarding complex split transactions.',
        },
        DefaultCCToCleared: {
          name: 'DefaultCCToCleared',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Use Cleared Balance for "Record Payment"',
          description:
            "Change the default credit card payment value to use the Cleared Balance instead of the Working Balance to avoid overpaying credit card bills. *__Note__: If you don't have enough budgeted in Payment to cover the selected option, it will use the Payment value instead to avoid overbudgeting*",
        },
        DeselectTransactionsOnSave: {
          name: 'DeselectTransactionsOnSave',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Deselect Transactions on Save',
          description: 'Deselect all transactions after a transaction is saved.',
        },
        AccountsEmphasizedInflows: {
          name: 'AccountsEmphasizedInflows',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Emphasize Inflows',
          description: 'Make values in the inflow column green.',
        },
        AccountsEmphasizedOutflows: {
          name: 'AccountsEmphasizedOutflows',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Emphasize Outflows',
          description: 'Make values in the outflow column red and put them in parenthesis.',
        },
        LargerClickableIcons: {
          name: 'LargerClickableIcons',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Enlarge Small Icons',
          description:
            'Makes the uncleared, cleared and reconciled icons slightly larger and easier to click.',
        },
        LinkInMemo: {
          name: 'LinkInMemo',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Hyperlinks in the memo field',
          description: 'Add support for links in memos on the accounts page.',
        },
        MemoAsMarkdown: {
          name: 'MemoAsMarkdown',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Enable Markdown in Memos',
          description:
            'Enables Markdown parsing for memos, allowing support for links and other formatting. Learn how to use Markdown [here](https://www.markdownguide.org/cheat-sheet).',
        },
        ReconcileAssistant: {
          name: 'ReconcileAssistant',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Reconciliation Assistance',
          description:
            'Provides a tool to help find uncleared transactions which add up to the provided reconciliation amount during the normal reconciliation flow.',
        },
        ReconcileBalance: {
          name: 'ReconcileBalance',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Show Reconciled Balance',
          description:
            'Show the current reconciled balance excluding cleared and non-reconciled transactions',
        },
        ReconcileConfetti: {
          name: 'ReconcileConfetti',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Show Reconcile Confetti',
          description:
            'Add a fun confetti animation when marking an account as reconciled to mark your tremendous achievement.',
        },
        ReconciledTextColor: {
          name: 'ReconciledTextColor',
          type: 'select',
          default: false,
          section: 'accounts',
          title: 'Emphasize Reconciled Transactions',
          description:
            'Add emphasis to reconciled transaction rows to better distinguish them from "active" transactions.',
          options: [
            {
              name: 'Green',
              value: '1',
            },
            {
              name: 'Light gray',
              value: '2',
            },
            {
              name: 'Dark gray',
              value: '3',
            },
            {
              name: 'Dark gray with green background',
              value: '4',
            },
          ],
        },
        ResetColumnWidths: {
          name: 'ResetColumnWidths',
          type: 'checkbox',
          default: true,
          section: 'accounts',
          title: 'Add Reset Column Widths Button',
          description: 'Adds button to reset column widths on in the accounts View menu.',
        },
        RowHeight: {
          name: 'RowHeight',
          type: 'select',
          default: false,
          section: 'accounts',
          title: 'Adjust Transaction Row Height',
          description:
            'Make the height of transaction rows smaller allowing more transactions to fit on the screen.',
          options: [
            {
              name: 'Compact',
              value: '1',
            },
            {
              name: 'Slim',
              value: '2',
            },
          ],
        },
        RowSplitMonths: {
          name: 'RowSplitMonths',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Visually separate transactions between months',
          description:
            'Add a thick line in the transactions table after the last transactions of a month to visually separate from the next month.',
        },
        ScrollableEditMenu: {
          name: 'ScrollableEditMenu',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Add Scrollbars to Edit Menu',
          description: 'Resize the edit menu to fit on the screen and add scrollbars.',
        },
        ShowCategoryBalance: {
          name: 'ShowCategoryBalance',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Show Available Category Balance on Hover',
          description:
            "Add a tooltip showing the total available balance for a transaction's category after breifly hovering the transaction category.",
        },
        SplitTransactionAutoAdjust: {
          name: 'SplitTransactionAutoAdjust',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Automatically Fill Split Transaction Amount',
          description:
            'Automatically fill each additional split transaction row with the current remaining amount.',
        },
        SplitTransactionAutoFillPayee: {
          name: 'SplitTransactionAutoFillPayee',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Automatically Fill Split Transaction Payee',
          description:
            'Automatically fill the split transaction payee value, if empty, with the original payee.',
        },
        SplitTransactionTabExpand: {
          name: 'SplitTransactionTabExpand',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Automatically Add Next Split',
          description:
            'Automatically add a new split row when tabbing past the last split\'s "Inflow" input.',
        },
        SwapClearedFlagged: {
          name: 'SwapClearedFlagged',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Swap Flag/Cleared Columns',
          description:
            'Place the Cleared column on the left and the Flagged column on the right sides of an account screen.',
        },
        ToggleAccountColumns: {
          name: 'ToggleAccountColumns',
          type: 'checkbox',
          default: true,
          section: 'accounts',
          title: 'Add "Toggle Memo" Option',
          description:
            'Add an option to toggle the memo column under the account page\'s "View" menu',
        },
        ToggleSplits: {
          name: 'ToggleSplits',
          type: 'checkbox',
          default: false,
          section: 'accounts',
          title: 'Add "Toggle Splits" Button',
          description:
            'Add a button to expand/collapse all splits for the current account register.',
        },
        ToggleTransactionFilters: {
          name: 'ToggleTransactionFilters',
          type: 'select',
          default: false,
          section: 'accounts',
          title: 'Add "Scheduled" and "Reconciled" Toggle Buttons',
          description:
            'Add buttons to quickly show/hide either scheduled or reconciled transactions with one click.',
          options: [
            {
              name: 'Show Icons',
              value: '1',
            },
            {
              name: 'Show Icons and Text Labels',
              value: '2',
            },
          ],
        },
        DisableToolkit: {
          name: 'DisableToolkit',
          type: 'checkbox',
          default: false,
          section: 'advanced',
          title: 'Disable Toolkit for YNAB',
          description: 'Turn all features on and off with a single switch.',
        },
        BudgetProgressBars: {
          name: 'BudgetProgressBars',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Budget Rows Progress Bars',
          description:
            'Add progress bars and a vertical bar that shows how far you are through the month to category rows.',
          options: [
            {
              name: 'Target progress',
              value: 'goals',
            },
            {
              name: 'Pacing progress',
              value: 'pacing',
            },
            {
              name: 'Pacing on name column and targets on budgeted column',
              value: 'both',
            },
          ],
        },
        CategoryActivityPopupWidth: {
          name: 'CategoryActivityPopupWidth',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Adjust Category Activity Popup Size',
          description:
            'Makes the screen that pops up when you click on activity from a budget category wider so you can see more details of the transactions listed.',
          options: [
            {
              name: 'Medium',
              value: '1',
            },
            {
              name: 'Large',
              value: '2',
            },
          ],
        },
        CheckCreditBalances: {
          name: 'CheckCreditBalances',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Paid in Full Credit Card Assist',
          description:
            'Highlights credit card category balances with a yellow warning and adds an alert icon next to the account if the balance of the category does not match the account balance. Adds a button to the Inspector to rectify the difference.',
        },
        CollapseInspector: {
          name: 'CollapseInspector',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Collapse Budget Inspector',
          description: 'Add a collapse button to the bottom of the budget inspector.',
        },
        MasterCategoryRowColor: {
          name: 'MasterCategoryRowColor',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Colored Master Category Row',
          description: 'Adds Color to Master Category Row.',
        },
        MasterCategoryRowColorSelect: {
          name: 'MasterCategoryRowColorSelect',
          type: 'color',
          default: '#d1d1d6',
          section: 'budget',
          title: 'Colored Master Category Row - Default/Classic Theme Color',
          description:
            'The color which will be used for the Default and Classic YNAB Themes. The default is #d1d1d6.',
        },
        MasterCategoryRowDarkColorSelect: {
          name: 'MasterCategoryRowDarkColorSelect',
          type: 'color',
          default: '#636366',
          section: 'budget',
          title: 'Colored Master Category Row - Dark Theme Color',
          description:
            'The color which will be used for the Dark YNAB Theme. The default is #636366.',
        },
        CreditCardEmoji: {
          name: 'CreditCardEmoji',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Credit Card Emoji',
          description: 'Adds a credit card emoji 💳 to the "Credit Card Payments" category.',
        },
        CustomAverageBudgeting: {
          name: 'CustomAverageBudgeting',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Add Custom Average Month Quick Budget',
          description: 'Select an average month count to calculate a quick budget option with',
          options: [
            {
              name: '3 months',
              value: '3',
            },
            {
              name: '6 months',
              value: '6',
            },
            {
              name: '12 months',
              value: '12',
            },
          ],
        },
        DateOfMoney: {
          name: 'DateOfMoney',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Add Date of Money Tooltip',
          description:
            'Hovering "Age of Money" will display the date of the income.\n For example, on 11th January with Age of Money = 10, Date of Money would be 1st January.',
        },
        DaysOfBuffering: {
          name: 'DaysOfBuffering',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Add Days of Buffering',
          description:
            "Add a calculation which shows how long your money would likely last if you never earned another cent based on your average spending from a chosen date range. We know that no month is 'average' but this should give you some idea of how much of a buffer you have. The actual calculation is the sum of all your budget accounts divided by the average daily outflow in the time range. Optionally, you can exclude negative credit card balances for better accuracy when carrying credit card debt.",
          options: [
            {
              name: 'Look Back Infinitely',
              value: 'all',
            },
            {
              name: 'Look Back 1 Year',
              value: '12',
            },
            {
              name: 'Look Back 6 Months',
              value: '6',
            },
            {
              name: 'Look Back 3 Months',
              value: '3',
            },
            {
              name: 'Look Back 1 Month',
              value: '1',
            },
          ],
        },
        DaysOfBufferingExcludeCreditCards: {
          name: 'DaysOfBufferingExcludeCreditCards',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Add Days of Buffering - Exclude Credit Cards',
          description:
            'Option to exclude credit cards from the days of buffering calculation, this will usually eliminate negative calculations for Days of Buffering but it should be noted that this will also inflate you "Days of Buffering" as far as the actual calculation goes.',
        },
        DisplayTargetGoalAmount: {
          name: 'DisplayTargetGoalAmount',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Display Target and Emphasize Overbudget',
          description:
            'Adds a "Target" column which displays the target amount for every category with a target. Optionally emphasize the amount as red if you\'ve budgeted beyond your target or green if you\'ve met/exceeded your target.',
          options: [
            {
              name: 'Display target amount with no emphasis',
              value: '3',
            },
            {
              name: 'Display target amount and emphasize overbudget with red',
              value: '1',
            },
            {
              name: 'Display target amount and emphasize funded targets as green',
              value: '2',
            },
          ],
        },
        DisplayTotalMonthlyGoals: {
          name: 'DisplayTotalMonthlyGoals',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Add Total Monthly Targets',
          description:
            "Add a 'Total Monthly Targets' section to the budget inspector, which displays the total amount of monthly funding targets. It's also possible to have a more detailed overview of the targets, and information of 'Income vs Spending' for the month.",
          options: [
            {
              name: 'Show monthly target amount',
              value: 'show-total-only',
            },
            {
              name: 'Show monthly target amount with targets breakdown',
              value: 'show-goal-breakdown',
            },
            {
              name: 'Show monthly target amount, targets breakdown and income vs spending overview',
              value: 'show-goal-breakdown-and-income-vs-spending',
            },
          ],
        },
        DisplayTotalOverspent: {
          name: 'DisplayTotalOverspent',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Show Total Overspent',
          description:
            'Adds "Overspending" to the budget inspector, which displays the total overspending from selected categories.',
        },
        DisplayUpcomingAmount: {
          name: 'DisplayUpcomingAmount',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Show Upcoming Transaction Total',
          description:
            'Add the total of upcoming transactions alongside activity for each category.',
        },
        EnlargeCategoriesDropdown: {
          name: 'EnlargeCategoriesDropdown',
          type: 'checkbox',
          default: true,
          section: 'budget',
          title: 'Adjust Category Dropdown Size',
          description:
            'The Categories Dropdown that shows in the move money modal is quite small. Show more categories if the page real estate allows for it.',
        },
        FilterCategories: {
          name: 'FilterCategories',
          type: 'checkbox',
          default: true,
          section: 'budget',
          title: 'Add Category Filter',
          description: 'Add a textbox to the budget page allowing you to filter categories.',
        },
        FundHalf: {
          name: 'FundHalf',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Add Fund Half',
          description:
            "Adds a button or buttons to fund half of your category's monthly Target amount.  Perfect for budget categories you fund half of twice a month.  Low Half/High Half refers to which you assign when the monthly Target amount is an odd number.  Works with multiple selected budget categories.",
        },
        GoalIndicator: {
          name: 'GoalIndicator',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Add Target Indicator',
          description:
            'Add an indicator to subcategories with targets. Types: (M)onthly Savings Builder, Savings Balance By (D)ate, Savings (B)alance, Needed For (S)pending, (M)onthly (D)ebt Payment, and (U)pcoming transactions.',
        },
        GoalWarningColor: {
          name: 'GoalWarningColor',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Emphasize Underfunded Targets',
          description:
            'Change the default orange target underfunded warning to blue to better differentiate it from credit card overspending.',
        },
        HideAgeOfMoney: {
          name: 'HideAgeOfMoney',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Hide Age of Money',
          description:
            'Hides "Age of Money" in the budget header. YNAB will continue to run its Age of Money calculations, so the data will always be up to date if you decide to show it again.',
        },
        HoveredBudgetRows: {
          name: 'HoveredBudgetRows',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Highlight Budget Rows On Hover',
          description: 'Shows a light gray background on category rows when hovered over.',
        },
        CurrentMonthIndicator: {
          name: 'CurrentMonthIndicator',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Emphasize Current Month',
          description:
            "Change the month background color to better distinguish you're looking at the current month.",
        },
        HighlightNegatives: {
          name: 'HighlightNegatives',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Highlight all Negative Category Balances Red',
          description:
            'Ensure all negative balances are highlighted red instead of yellow, even with credit card spending.',
        },
        LiveOnLastMonthsIncome: {
          name: 'LiveOnLastMonthsIncome',
          type: 'select',
          default: false,
          section: 'budget',
          title: "Live on Last Month's Income",
          description:
            "Add a section to the budget inspector showing your variance between last month's income and this month's assigned budget for users who still live by the old Rule #4.",
          options: [
            {
              name: 'Use previous month',
              value: '1',
            },
            {
              name: 'Use month before last',
              value: '2',
            },
            {
              name: 'Use two months before last',
              value: '3',
            },
            {
              name: 'Use three months before last',
              value: '4',
            },
          ],
        },
        MonthlyNotesPopupWidth: {
          name: 'MonthlyNotesPopupWidth',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Adjust Monthly Notes Popup Size',
          description:
            "Makes the screen that pops up when you click on 'Enter a note...' below the month name wider so you can add more text.",
          options: [
            {
              name: 'Medium',
              value: '1',
            },
            {
              name: 'Large',
              value: '2',
            },
          ],
        },
        NotesAsMarkdown: {
          name: 'NotesAsMarkdown',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Enable Markdown in Notes',
          description:
            'Adds Markdown parsing to notes, allowing support for links, bullet points, and other formatting tools. Learn how to use Markdown [here](https://www.markdownguide.org/cheat-sheet).',
        },
        Pacing: {
          name: 'Pacing',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Add Pacing',
          description:
            'Add a column for "pacing" which shows you how much money you have left in your budget proportionate to how much time is left in the month.',
          options: [
            {
              name: 'Show Full Amount',
              value: '1',
            },
            {
              name: 'Show Simple Indicator',
              value: '2',
            },
            {
              name: 'Show Days Ahead/Behind Schedule',
              value: '3',
            },
          ],
        },
        QuickBudgetWarning: {
          name: 'QuickBudgetWarning',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Add Quick Budget Confirmation',
          description:
            'Pop up a confirmation prompt when using a quick budget option to prevent mistakingly altering your budget.',
        },
        RemovePositiveHighlight: {
          name: 'RemovePositiveHighlight',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Unhighlight all Positive Category Balances',
          description:
            'Removes the highlight colour from positive (or zero) category balances and colours positive balances green instead.',
        },
        RowsHeight: {
          name: 'RowsHeight',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Adjust Budget Row Height',
          description:
            'Make the height of budget category rows smaller allowing more categories to fit on the screen.',
          options: [
            {
              name: 'Compact',
              value: '1',
            },
            {
              name: 'Slim',
              value: '2',
            },
            {
              name: 'Slim with smaller font',
              value: '3',
            },
            {
              name: 'Medium',
              value: '4',
            },
            {
              name: 'Large',
              value: '5',
            },
          ],
        },
        ShowAvailableAfterSavings: {
          name: 'ShowAvailableAfterSavings',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Show Available After Savings',
          description:
            'Shows "Available After Savings" in the budget breakdown. This allows you to see how much you have available if you exclude your savings. Any categories under a category group that includes "Savings" in its name will be taken into account. You can also add "Savings" anywhere in the name of a category to mark it.',
        },
        StripedBudgetRows: {
          name: 'StripedBudgetRows',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Striped Budget Rows',
          description: 'Shows a light gray background on alternating category rows.',
        },
        SubtractUpcomingFromAvailable: {
          name: 'SubtractUpcomingFromAvailable',
          type: 'select',
          default: false,
          section: 'budget',
          title: 'Subtract Upcoming Transactions from Available Balance',
          description:
            'Subtracts upcoming transactions from the available balance for each category. In other words, treat upcoming transactions as if the money has already been spent. Also shows "Available After Upcoming Transactions" in the budget breakdown.\n\nAdditionally, this feature totals the amounts in the "Payment" column of your CC category group and subtracts that from the "Available After Upcoming Transactions" in the budget breakdown. This allows you to see how much you have available if you exclude the money "reserved" in your Credit Card Payments category group. You can turn this part of the feature off by selecting "Don\'t Include CC Payments".\n\nIf the "Show Available After Savings" feature is enabled, the "Available After Savings" amount is used as the starting point for the budget breakdown calculations.',
          options: [
            {
              name: 'Subtract Upcoming from Available',
              value: '1',
            },
            {
              name: "Don't Include CC Payments",
              value: 'no-cc',
            },
          ],
        },
        ToBeBudgetedWarning: {
          name: 'ToBeBudgetedWarning',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Emphasize Available to Assign',
          description:
            'Changes the "Ready to Assign" background color to yellow if there is unallocated money left to be budgeted.',
        },
        ToggleMasterCategories: {
          name: 'ToggleMasterCategories',
          type: 'checkbox',
          default: false,
          section: 'budget',
          title: 'Add Master Category Toggle',
          description:
            'Add a toggle to the budget table header to expand/collapse all categories at once. You can also enable "Solo Mode" by right clicking the toggle which will ensure only one category is expanded at a time.',
        },
        AccountsDisplayDensity: {
          name: 'AccountsDisplayDensity',
          type: 'select',
          default: false,
          section: 'general',
          title: 'Adjust Account Name Height',
          description:
            'Make the account names and their padding in the sidebar smaller allowing more accounts to fit on the screen.',
          options: [
            {
              name: 'Compact',
              value: '1',
            },
            {
              name: 'Slim',
              value: '2',
            },
          ],
        },
        BetterScrollbars: {
          name: 'BetterScrollbars',
          type: 'select',
          default: false,
          section: 'general',
          title: 'Adjust Scrollbars Size',
          description: 'Choose between smaller and cleaner scrollbars across the application.',
          options: [
            {
              name: 'Small',
              value: '1',
            },
            {
              name: 'Tiny',
              value: '2',
            },
            {
              name: 'Off',
              value: '3',
            },
          ],
        },
        CategoryActivityCopy: {
          name: 'CategoryActivityCopy',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'Add "Copy Transactions" to Activity Modals',
          description:
            'Add a button to copy transactions displayed in the various Activity Modals (Budget and Reports pages).',
        },
        CustomizeColourScheme: {
          name: 'CustomizeColourScheme',
          type: 'checkbox',
          default: true,
          section: 'general',
          title: 'Modify Currency Colors',
          description:
            "Add an option in YNAB's Display Menu to customize the default green/orange/red color scheme to whatever you wish.",
        },
        EditAccountButton: {
          name: 'EditAccountButton',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'Hide Edit Account Button',
          description:
            'Hide the "Edit Account" icon on account rows in the sidebar to avoid misclicks. You can still edit an account by right-clicking the account name.',
        },
        EmphasizeNegativeLoans: {
          name: 'EmphasizeNegativeLoans',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'Emphasize Negative Loans',
          description:
            'Emphasize loans with negative balances similar to how other negative accounts are emphasized.',
        },
        GoogleFontsSelector: {
          name: 'GoogleFontsSelector',
          type: 'select',
          default: false,
          section: 'general',
          title: 'Modify Interface Font',
          description:
            'Select a font from the Google Fonts library or choose to use your system font.',
          options: [
            {
              name: 'Open Sans',
              value: '1',
            },
            {
              name: 'Roboto',
              value: '2',
            },
            {
              name: 'Roboto Condensed',
              value: '3',
            },
            {
              name: 'Droid Sans',
              value: '4',
            },
            {
              name: 'Inconsolata',
              value: '5',
            },
            {
              name: 'System font',
              value: '6',
            },
          ],
        },
        HideAccountBalancesType: {
          name: 'HideAccountBalancesType',
          type: 'select',
          default: false,
          section: 'general',
          title: 'Hide Account Balances',
          description: 'Allows you to hide account type totals and/or account balances.',
          options: [
            {
              name: 'Hide All',
              value: '1',
            },
            {
              name: 'Hide Account Type Totals',
              value: '2',
            },
            {
              name: 'Hide Account Balances',
              value: '3',
            },
          ],
        },
        HideClosedAccounts: {
          name: 'HideClosedAccounts',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'Hide Closed Accounts',
          description:
            'Hide closed accounts from the sidebar. They can then be toggled using the button added to the User Menu (click your e-mail).',
        },
        HideHelp: {
          name: 'HideHelp',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'Hide Blue Help (?) Button',
          description:
            'Hide the blue help (?) button in the bottom right corner of the screen. The button can then be toggled using the button added to the User Menu (click your e-mail).',
        },
        HideReferralBanner: {
          name: 'HideReferralBanner',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'Hide Referral Banner',
          description: 'Hides the "Share YNAB, Get YNAB free" banner.',
        },
        ImportNotification: {
          name: 'ImportNotification',
          type: 'select',
          default: false,
          section: 'general',
          title: 'Emphasize Accounts Needing Import',
          description:
            'Adds an underline to account names in the sidebar that have transactions to be imported. Hovering over the account name will display the number of transactions waiting to be imported.',
          options: [
            {
              name: 'Underline in white',
              value: '1',
            },
            {
              name: 'Underline in red',
              value: '2',
            },
          ],
        },
        NavDisplayDensity: {
          name: 'NavDisplayDensity',
          type: 'select',
          default: false,
          section: 'general',
          title: 'Adjust Navigation Tabs Height',
          description:
            'Make the navigation tab names (Budget, Reports, etc) and their padding smaller allowing more content to fit on the screen.',
          options: [
            {
              name: 'Compact',
              value: '1',
            },
            {
              name: 'Slim',
              value: '2',
            },
          ],
        },
        POSStyleCurrencyEntryMode: {
          name: 'POSStyleCurrencyEntryMode',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'POS-style Currency Entry',
          description:
            'Allow entry of currency values without decimal separators (as done in real-life on POS terminals). For example, entering a figure of "500" will expand to "5.00". Values containing decimal separators will be left unmodified (e.g. "50.00" will stay "50.00"). As a shorthand, values ending with "-" will be expanded to full monetary unit (e.g. "50-" will result in "50.00"). Math operations are supported as well (e.g. "50*5" becomes "2.50").',
        },
        PrintingImprovements: {
          name: 'PrintingImprovements',
          type: 'checkbox',
          default: true,
          section: 'general',
          title: 'Printing Improvements',
          description:
            'Changes print styles so budget and account sections can be easily printed. Due to the number of columns, the account section should be printed using landscape orientation.',
        },
        PrivacyMode: {
          name: 'PrivacyMode',
          type: 'select',
          default: false,
          section: 'general',
          title: 'Privacy Mode',
          description:
            'Obscure dollar amounts everywhere until hovered. In toggle mode, a lock icon will appear in the lower left corner of YNAB. Click to enable or disable privacy mode.',
          options: [
            {
              name: 'Always On',
              value: '1',
            },
            {
              name: 'Add Toggle Button',
              value: '2',
            },
          ],
        },
        RewordPlanToBudget: {
          name: 'RewordPlanToBudget',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'Reword "Plan" to "Budget"',
          description: 'Change navigation button title from "Plan" back to "Budget"',
        },
        SquareNegativeMode: {
          name: 'SquareNegativeMode',
          type: 'checkbox',
          default: false,
          section: 'general',
          title: 'Emphasize Negative Numbers',
          description:
            'Make all round borders on all negative numbers square making them a bit more of an eyesore so you want to get rid of them!',
        },
        UnclearedAccountHighlight: {
          name: 'UnclearedAccountHighlight',
          type: 'select',
          default: false,
          section: 'general',
          title: 'Emphasize Uncleared Accounts',
          description:
            'Add a small indicator next to account balances on the sidebar to indicate not all transactions are cleared.',
          options: [
            {
              name: 'Uncleared Accounts',
              value: '1',
            },
            {
              name: 'Uncleared and Unreconciled Accounts',
              value: '2',
            },
          ],
        },
        CompactIncomeVsExpense: {
          name: 'CompactIncomeVsExpense',
          type: 'checkbox',
          default: false,
          section: 'reports',
          title: 'Compact Income vs. Expense',
          description:
            "Modifies styling of the Income vs. Expense report so it doesn't use too much white space on the page.",
        },
        IncomeVsExpenseHoverHighlight: {
          name: 'IncomeVsExpenseHoverHighlight',
          type: 'checkbox',
          default: true,
          section: 'reports',
          title: 'Highlight Income vs Expense Row on Hover',
          description:
            'Provides a highlight over the currently hovered row on the native YNAB Income vs Expense report.',
        },
        ViewZeroAsEmpty: {
          name: 'ViewZeroAsEmpty',
          type: 'checkbox',
          default: false,
          section: 'reports',
          title: 'Hide Zero Cells',
          description:
            'If a cell is zero in the Income v. Expense report, replace it with an empty cell so it is easier to focus on non-zero cells. "Total" rows are not modified.',
        },
        HideDebtRatio: {
          name: 'HideDebtRatio',
          type: 'checkbox',
          default: false,
          section: 'toolkitReports',
          title: 'Hide Debt Ratio in Toolkit Reports: Net Worth',
          description:
            'Hide debt ratio (debts / assets * 100%) in the Toolkit Reports Net Worth page',
        },
        SavingsRatio: {
          name: 'SavingsRatio',
          type: 'select',
          default: '0.10',
          section: 'toolkitReports',
          title: 'Savings Ratio',
          description:
            'Display savings ratio (how much of income you do not spend) in Toolkit reports. Enable this to select target savings ratio. All values below this threshold will be painted red.',
          options: [
            {
              name: '5%',
              value: '0.05',
            },
            {
              name: '10%',
              value: '0.10',
            },
            {
              name: '15%',
              value: '0.15',
            },
            {
              name: '20%',
              value: '0.20',
            },
            {
              name: '25%',
              value: '0.25',
            },
            {
              name: '30%',
              value: '0.30',
            },
            {
              name: '35%',
              value: '0.35',
            },
            {
              name: '40%',
              value: '0.40',
            },
            {
              name: '45%',
              value: '0.45',
            },
            {
              name: '50%',
              value: '0.50',
            },
            {
              name: '55%',
              value: '0.55',
            },
            {
              name: '60%',
              value: '0.60',
            },
            {
              name: '65%',
              value: '0.65',
            },
            {
              name: '70%',
              value: '0.70',
            },
            {
              name: '75%',
              value: '0.75',
            },
            {
              name: '80%',
              value: '0.80',
            },
            {
              name: '85%',
              value: '0.85',
            },
            {
              name: '90%',
              value: '0.90',
            },
            {
              name: '95%',
              value: '0.95',
            },
          ],
        },
        ToolkitReports: {
          name: 'ToolkitReports',
          section: 'toolkitReports',
          default: true,
          type: 'checkbox',
          title: 'Toolkit Reports',
          description:
            'Adds Toolkit Reports to the sidebar. Current reports include: Net Worth, Spending By Category/Payee, and Income vs Expense',
        },
        ToolkitReportsURLNavigation: {
          name: 'ToolkitReportsURLNavigation',
          type: 'checkbox',
          default: false,
          section: 'toolkitReports',
          title: 'Enable URL Navigation for Toolkit Reports',
          description:
            'Enable URL-based navigation for Toolkit Reports. This allows you to navigate directly to specific report tabs and share links to reports.',
        },
      };
      const settingMigrationMap = {
        ConfirmEditTransactionCancellation: {
          oldSettingName: 'ConfirmKeyboardCancelationOfTransactionChanges',
        },
        ToggleMasterCategories: {
          oldSettingName: 'CategorySoloMode',
          settingMapping: {
            0: false,
            'cat-solo-mode': true,
            'cat-toggle-all': true,
            'cat-solo-mode-toggle-all': true,
          },
        },
        LiveOnLastMonthsIncome: {
          oldSettingName: 'IncomeFromLastMonth',
        },
        ReconcileAssistant: {
          oldSettingName: 'AssistedClear',
        },
      };
      const allToolkitSettings = Object.values(settingsMap);

      /***/
    },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/compat get default export */
  /******/ (() => {
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = (module) => {
      /******/ var getter =
        module && module.__esModule ? /******/ () => module['default'] : /******/ () => module;
      /******/ __webpack_require__.d(getter, { a: getter });
      /******/ return getter;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        /******/
      }
      /******/ Object.defineProperty(exports, '__esModule', { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  (() => {
    'use strict';
    __webpack_require__.r(__webpack_exports__);
    /* harmony import */ var toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__ =
      __webpack_require__(10);
    /* harmony import */ var toolkit_core_common_storage__WEBPACK_IMPORTED_MODULE_1__ =
      __webpack_require__(44);
    /* harmony import */ var toolkit_core_settings__WEBPACK_IMPORTED_MODULE_2__ =
      __webpack_require__(57);
    /* harmony import */ var _messages__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(447);

    const storage = new toolkit_core_common_storage__WEBPACK_IMPORTED_MODULE_1__.ToolkitStorage();
    let toolkitInitiated = false;
    function sendToolkitBootstrap(options) {
      const browser = (0,
      toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getBrowser)();
      const environment = (0,
      toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getEnvironment)();
      const manifest = browser.runtime.getManifest();
      window.postMessage(
        {
          type: _messages__WEBPACK_IMPORTED_MODULE_3__.InboundMessageType.Bootstrap,
          ynabToolKit: {
            assets: {
              logo: browser.runtime.getURL('assets/images/logos/toolkitforynab-logo-200.png'),
            },
            environment,
            extensionId: browser.runtime.id,
            name: manifest.name,
            options,
            version: manifest.version,
          },
        },
        '*',
      );
    }
    function toolkitMessageHandler(event) {
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case _messages__WEBPACK_IMPORTED_MODULE_3__.OutboundMessageType.ToolkitLoaded:
            initializeYNABToolkit();
            break;
          case 'ynab-toolkit-error':
            handleToolkitError(event.data.context);
            break;
          case 'ynab-toolkit-set-setting':
            handleSetFeatureSetting(event.data.setting);
        }
      }
    }
    function handleToolkitError(context) {
      (0,
      toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getBrowser)().runtime.sendMessage(
        {
          type: 'error',
          context,
        },
      );
    }
    function handleSetFeatureSetting({ name, value }) {
      storage.setFeatureSetting(name, value);
    }
    function handleFeatureSettingChanged(settingName, newValue) {
      if (
        settingName.startsWith(
          toolkit_core_common_storage__WEBPACK_IMPORTED_MODULE_1__.FEATURE_SETTING_PREFIX,
        )
      ) {
        window.postMessage({
          type: _messages__WEBPACK_IMPORTED_MODULE_3__.InboundMessageType.SettingChanged,
          setting: {
            name: settingName.slice(
              toolkit_core_common_storage__WEBPACK_IMPORTED_MODULE_1__.FEATURE_SETTING_PREFIX
                .length,
            ),
            value: newValue,
          },
        });
      }
    }
    async function initializeYNABToolkit() {
      const userSettings = await (0,
      toolkit_core_settings__WEBPACK_IMPORTED_MODULE_2__.getUserSettings)();
      sendToolkitBootstrap(userSettings);
    }
    async function init() {
      const isToolkitDisabled = await storage.getFeatureSetting('DisableToolkit');
      if (isToolkitDisabled) {
        console.log(
          `${
            (0,
            toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getBrowser)().runtime.getManifest()
              .name
          } is disabled!`,
        );
        return;
      }
      if (toolkitInitiated) {
        console.log(
          `${
            (0,
            toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getBrowser)().runtime.getManifest()
              .name
          } is already initiated`,
        );
        return;
      }
      console.log(
        `${
          (0,
          toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getBrowser)().runtime.getManifest()
            .name
        } initiated`,
      );

      // Load the toolkit bundle onto the YNAB dom
      const script = document.createElement('script');
      script.setAttribute('type', 'text/javascript');
      script.setAttribute(
        'src',
        (0,
        toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getBrowser)().runtime.getURL(
          'web-accessibles/ynab-toolkit.js',
        ),
      );
      document.getElementsByTagName('head')[0].appendChild(script);
      toolkitInitiated = true;

      // wait for the bundle to tell us it's loaded
      window.addEventListener('message', toolkitMessageHandler);
      toolkit_core_settings__WEBPACK_IMPORTED_MODULE_2__.allToolkitSettings.forEach(({ name }) => {
        storage.onFeatureSettingChanged(name, handleFeatureSettingChanged);
      });
    }
    init();
    storage.onToolkitDisabledChanged((_, isDisabled) => {
      if (!isDisabled) {
        init();
      }
    });
  })();

  /******/
})();
