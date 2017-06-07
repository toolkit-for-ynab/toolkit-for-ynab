module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
    },
    "plugins": ["import"],
    "settings": {
      "import/resolver": "webpack"
    },
    "extends": "airbnb-base/legacy",
    "globals": {
        "$": true,
        "Chart": true,
        "Ember": true,
        "Highcharts": true,
        "Intercom": true,
        "KangoAPI": true,
        "chrome": true,
        "ensureDefaultsAreSet": true,
        "getKangoExtensionInfo": true,
        "getKangoStorageKeys": true,
        "getKangoSetting": true,
        "jQuery": true,
        "kango": true,
        "moment": true,
        "noUiSlider": true,
        "safari": true,
        "setKangoSetting": true,
        "windowReload": true,
        "ynab": true,
        "ynabToolKit": true
    },
    "rules": {
        "consistent-return": "off",
        "default-case": "off",
        "guard-for-in": "off",
        "global-require": "off",
        "max-len": "off",
        "func-names": "off",
        "vars-on-top": "off",
        "no-console": "off",
        "no-extend-native": "off",
        "no-nested-ternary": "off",
        "no-param-reassign": "off",
        "no-restricted-syntax": "off",
        "no-underscore-dangle": "off",
        "no-use-before-define": "off",
        "radix": "off",
        "no-shadow": ["error", { "allow": ["resolve", "reject", "error"] }]
    }
};
