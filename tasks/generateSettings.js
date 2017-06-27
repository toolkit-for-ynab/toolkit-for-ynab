require('colors');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const defaultFeatures = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'))).defaultFeatures;

const LEAGACY_SETTINGS_PROJECT_DIR = 'source/common/res/features';
const NEW_SETTINGS_PROJECT_DIR = 'sauce/features';
const ALL_SETTINGS_OUTPUT = 'source/common/res/features/allSettings.js';
const REQUIRED_SETTINGS = ['name', 'type', 'default', 'section', 'title'];

const legacySettingMap = {
  AccountsDisplayDensity: 'accountsDisplayDensity',
  AutoCloseReconcile: 'closeReconcileWindow',
  ColourBlindMode: 'colourBlindMode',
  EmphasizedOutflows: 'accountsEmphasizedOutflows',
  GoalWarningColor: 'goalWarningColor',
  HideAgeOfMoney: 'hideAgeOfMoney',
  PrintingImprovements: 'printingImprovements',
  RemovePositiveHighlight: 'removePositiveHighlight',
  RowHeight: 'accountsRowHeight',
  RunningBalance: 'runningBalance',
  SquareNegativeMode: 'squareNegativeMode',
  StealingFromFuture: 'stealingFromNextMonth',
  StripedRows: 'accountsStripedRows',
};

let previousSettings;

function run(callback) {
  previousSettings = new Set();
  Promise.all([
    gatherLegacySettings(),
    gatherNewSettings()
  ]).then(values => {
    let validatedSettings = [];
    let settingsConcatenated = values[0].concat(values[1]);
    settingsConcatenated.forEach(setting => {
      if (Array.isArray(setting.setting)) {
        setting.setting.forEach(subSetting => {
          let validatedSetting = validateSetting({
            setting: subSetting,
            file: setting.file,
            legacy: setting.legacy
          });

          if (validatedSetting.hidden !== true) {
            validatedSettings.push(validatedSetting);
          }
        });
      } else {
        let validatedSetting = validateSetting(setting);

        if (validatedSetting.hidden !== true) {
          validatedSettings.push(validatedSetting);
        }
      }
    });

    let allSettingsFile = generateAllSettingsFile(validatedSettings);
    fs.writeFile(ALL_SETTINGS_OUTPUT, allSettingsFile, callback);
  }, reason => {
    callback(reason);
  }).catch(exception => {
    callback(exception.stack);
  });
}

function gatherLegacySettings() {
  return new Promise((resolve, reject) => {
    glob(`${LEAGACY_SETTINGS_PROJECT_DIR}/**/settings.js*`, (error, files) => {
      if (error) return reject(error);

      let legacySettingsPromises = [];

      files.forEach(file => {
        legacySettingsPromises.push(new Promise((resolve, reject) => {
          let setting;
          const filePath = `${__dirname}/../${file}`;
          try {
            setting = require(filePath); // eslint-disable-line global-require
          } catch (e) {
            fs.readFile(filePath, 'utf8', (error, data) => {
              if (error) return reject(error);
              setting = JSON.parse(data);
            });
          }

          resolve({ file, setting, legacy: true });
        }));
      });

      Promise.all(legacySettingsPromises).then(resolve, reject);
    });
  });
}

function gatherNewSettings() {
  return new Promise((resolve, reject) => {
    glob(path.join(NEW_SETTINGS_PROJECT_DIR, '**', 'settings.js'), (error, files) => {
      if (error) return reject(error);

      resolve(files.map(file => {
        const setting = require(path.join(__dirname, '..', file)); // eslint-disable-line global-require
        return { file, setting };
      }));
    });
  });
}

function validateSetting(settingObj) {
  const featureSettings = settingObj.setting;
  const settingFilename = settingObj.file;

  REQUIRED_SETTINGS.forEach(requiredSetting => {
    if (typeof featureSettings[requiredSetting] === 'undefined' || featureSettings[requiredSetting] === null) {
      logFatal(settingFilename,
        `"${requiredSetting}" is a required setting for all features.`
      );
    }
  });

  featureSettings.description = featureSettings.description || '';

  if (settingObj.legacy) {
    validateActions(settingObj);
  }

  if (previousSettings.has(featureSettings.name)) {
    logFatal(settingFilename, `Duplicate Setting: ${featureSettings.name}`);
  }

  previousSettings.add(featureSettings.name);

  switch (featureSettings.type) {
    case 'checkbox':
      if (featureSettings.default === true && !defaultFeatures.includes(featureSettings.name)) {
        logWarning(settingFilename,
          `${featureSettings.name} is not expected to be defaulted to on. If this default was intentional, add the feature name to the defaultFeatures array found in package.json`
        );
      }

      if (settingObj.legacy && typeof featureSettings.actions.true === 'undefined' && typeof featureSettings.actions.false === 'undefined') {
        logFatal(settingFilename,
          'Checkbox settings must declare an action for "true" or "false" to have any effect.'
        );
      }
      break;
    case 'select':
      if (settingObj.legacy && featureSettings.length < 2) {
        logFatal(settingFilename,
          'Select settings must have more than one action associated with them.'
        );
      }
      break;
    default:
      logFatal(settingFilename,
        `type "${featureSettings.type}" is invalid. Allowed types are: "select" and "checkbox"`
      );
  }

  return featureSettings;
}

function validateActions(settingObj) {
  const featureSettings = settingObj.setting;
  const settingFilename = settingObj.file;

  if (typeof featureSettings.actions === 'undefined') {
    logFatal(settingFilename,
      'Setting "actions" is required'
    );
  }

  for (const actionKey in featureSettings.actions) {
    const action = featureSettings.actions[actionKey];
    if (!Array.isArray(action)) {
      logFatal(settingFilename,
        'Actions must be declared as an array, for example ["injectCSS", "main.css"].'
      );
    }

    if (action.length % 2 !== 0) {
      logFatal(settingFilename,
        'Actions must have an even number of elements, for example ["injectCSS", "main.css"].'
      );
    }
  }

  for (const actionKey in featureSettings.actions) {
    let i = 0;
    while (i < featureSettings.actions[actionKey].length) {
      let currentAction = featureSettings.actions[actionKey][i];
      let featureDir = settingFilename.replace(/settings.js(on)?/, ''); // handle old & new style settings files

      if (currentAction === 'injectCSS' || currentAction === 'injectScript') {
        let fullPath = path.join(featureDir, featureSettings.actions[actionKey][i + 1]);
        fullPath = path.relative(path.join('source', 'common'), fullPath);
        featureSettings.actions[actionKey][i + 1] = fullPath;
      }

      i += 2;
    }
  }
}

function logFatal(settingFilename, message) {
  console.log(`Invalid setting found in ${settingFilename}`.red);
  console.log(`\t${message}\n`.red);
  process.exit(1);
}

function logWarning(settingFilename, message) {
  console.log(`Warning! Potential error found in ${settingFilename}`.yellow);
  console.log(`\t${message}\n`.yellow);
}

function generateAllSettingsFile(allSettings) {
  return `/* eslint-disable no-unused-vars */
/*
 ***********************************************************
 * Warning: This is a file generated by the build process. *
 *                                                         *
 * Any changes you make manually will be overwritten       *
 * the next time you run ./build or build.bat!             *
 ***********************************************************
*/

if (typeof window.ynabToolKit === 'undefined') { window.ynabToolKit = {}; }

const legacySettingMap = ${JSON.stringify(legacySettingMap)};

function getKangoSetting(settingName) {
  return new Promise(function (resolve) {
    kango.invokeAsync('kango.storage.getItem', settingName, function (data) {
      resolve(data);
    });
  });
}

function setKangoSetting(settingName, data) {
  return new Promise(function (resolve) {
    kango.invokeAsync('kango.storage.setItem', settingName, data, function () {
      resolve('success');
    });
  });
}

function getKangoStorageKeys() {
  return new Promise(function (resolve) {
    kango.invokeAsync('kango.storage.getKeys', function (keys) {
      resolve(keys);
    });
  });
}

function getKangoExtensionInfo() {
  return kango.getExtensionInfo();
}

function ensureDefaultsAreSet() {
  return new Promise(function (resolve) {
    getKangoStorageKeys().then(function (storedKeys) {
      var promises = [];

      ynabToolKit.settings.forEach(function (setting) {
        if (storedKeys.indexOf(setting.name) < 0) {
          const legacySetting = legacySettingMap[setting.name];
          if (legacySetting && storedKeys.indexOf(legacySetting)) {
            promises.push(getKangoSetting(legacySetting).then((data) => {
              return setKangoSetting(setting.name, data);
            }));
          } else {
            promises.push(setKangoSetting(setting.name, setting.default));
          }
        }
      });

      Promise.all(promises).then(function () {
        resolve();
      });
    });
  });
}

// eslint-disable-next-line quotes, object-curly-spacing, quote-props
window.ynabToolKit.settings = ${JSON.stringify(allSettings)};

// We don't update these from anywhere else, so go ahead and freeze / seal the object so nothing can be injected.
Object.freeze(window.ynabToolKit.settings);
Object.seal(window.ynabToolKit.settings);
`;
}

run(error => {
  if (error) {
    console.log(`Error: ${error}`.red);
    process.exit(1);
  }

  process.exit();
});
