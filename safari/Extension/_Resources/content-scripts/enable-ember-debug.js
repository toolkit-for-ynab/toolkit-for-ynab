/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = [
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    /* 0 */ /* 1 */ /* 2 */ /* 3 */ /* 4 */ /* 5 */ /* 6 */ /* 7 */ /* 8 */ /* 9 */ /* 10 */
    /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
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
    /* 11 */
    /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 12 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 13 */
    /***/ (module) => {
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
    /* 14 */
    /***/ (module) => {
      var core = (module.exports = { version: '2.6.9' });
      if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

      /***/
    },
    /* 15 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 16 */
    /***/ (__unused_webpack_module, exports, __webpack_require__) => {
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
    /* 17 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var isObject = __webpack_require__(18);
      module.exports = function (it) {
        if (!isObject(it)) throw TypeError(it + ' is not an object!');
        return it;
      };

      /***/
    },
    /* 18 */
    /***/ (module) => {
      module.exports = function (it) {
        return typeof it === 'object' ? it !== null : typeof it === 'function';
      };

      /***/
    },
    /* 19 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 20 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 21 */
    /***/ (module) => {
      module.exports = function (exec) {
        try {
          return !!exec();
        } catch (e) {
          return true;
        }
      };

      /***/
    },
    /* 22 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var isObject = __webpack_require__(18);
      var document = __webpack_require__(13).document;
      // typeof document.createElement is 'object' in old IE
      var is = isObject(document) && isObject(document.createElement);
      module.exports = function (it) {
        return is ? document.createElement(it) : {};
      };

      /***/
    },
    /* 23 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 24 */
    /***/ (module) => {
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
    /* 25 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 26 */
    /***/ (module) => {
      var hasOwnProperty = {}.hasOwnProperty;
      module.exports = function (it, key) {
        return hasOwnProperty.call(it, key);
      };

      /***/
    },
    /* 27 */
    /***/ (module) => {
      var id = 0;
      var px = Math.random();
      module.exports = function (key) {
        return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
      };

      /***/
    },
    /* 28 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      module.exports = __webpack_require__(29)('native-function-to-string', Function.toString);

      /***/
    },
    /* 29 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 30 */
    /***/ (module) => {
      module.exports = false;

      /***/
    },
    /* 31 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 32 */
    /***/ (module) => {
      module.exports = function (it) {
        if (typeof it != 'function') throw TypeError(it + ' is not a function!');
        return it;
      };

      /***/
    },
    /* 33 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 34 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // to indexed object, toObject with fallback for non-array-like ES3 strings
      var IObject = __webpack_require__(35);
      var defined = __webpack_require__(37);
      module.exports = function (it) {
        return IObject(defined(it));
      };

      /***/
    },
    /* 35 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 36 */
    /***/ (module) => {
      var toString = {}.toString;

      module.exports = function (it) {
        return toString.call(it).slice(8, -1);
      };

      /***/
    },
    /* 37 */
    /***/ (module) => {
      // 7.2.1 RequireObjectCoercible(argument)
      module.exports = function (it) {
        if (it == undefined) throw TypeError("Can't call method on  " + it);
        return it;
      };

      /***/
    },
    /* 38 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      // 7.1.15 ToLength
      var toInteger = __webpack_require__(39);
      var min = Math.min;
      module.exports = function (it) {
        return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
      };

      /***/
    },
    /* 39 */
    /***/ (module) => {
      // 7.1.4 ToInteger
      var ceil = Math.ceil;
      var floor = Math.floor;
      module.exports = function (it) {
        return isNaN((it = +it)) ? 0 : (it > 0 ? floor : ceil)(it);
      };

      /***/
    },
    /* 40 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var toInteger = __webpack_require__(39);
      var max = Math.max;
      var min = Math.min;
      module.exports = function (index, length) {
        index = toInteger(index);
        return index < 0 ? max(index + length, 0) : min(index, length);
      };

      /***/
    },
    /* 41 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 42 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
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
    /* 43 */
    /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
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
    /******/
  ];
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

    const script = document.createElement('script');
    script.setAttribute('id', 'ynab-toolkit-ember-boot');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute(
      'src',
      (0,
      toolkit_core_common_web_extensions__WEBPACK_IMPORTED_MODULE_0__.getBrowser)().runtime.getURL(
        'web-accessibles/enable-ember-debug.js',
      ),
    );
    document.documentElement.appendChild(script);
  })();

  /******/
})();
