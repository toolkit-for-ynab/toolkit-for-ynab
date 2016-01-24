#!/usr/bin/env python

import os
import json
import traceback
import urllib

allSettings = []
allInitContent = []
previousNames = set()

def checkIndividualSetting(setting, dirName):
    if not 'name' in setting:
        raise ValueError('Every setting must have a name property.')

    if setting['name'] in previousNames:
        raise ValueError('Duplicate setting name: ' + setting['name'])

    previousNames.add(setting['name'])

    if not 'type' in setting:
        raise ValueError('Every setting must have a type property.')

    if setting['type'] != 'checkbox' and setting['type'] != 'select':
        raise ValueError('Only checkbox and select settings are supported at this time. Pull requests are welcome!')

    if not 'title' in setting:
        raise ValueError('Every setting must have a title.')

    if not 'actions' in setting:
        raise ValueError('Every setting must declare actions that happen when the setting is activated.')

    for action in setting['actions']:
        if not isinstance(setting['actions'][action], list):
            raise ValueError('Actions must be declared as an array, for example ["injectCSS", "main.css"].')

        if len(setting['actions'][action]) % 2 != 0:
            raise ValueError('Actions must have an even number of elements, for example ["injectCSS", "main.css"].')

    if setting['type'] == 'checkbox':
        if not 'true' in setting['actions'] and not 'false' in setting['actions']:
            raise ValueError('Checkbox settings must declare an action for "true" or "false" to have any effect.')
    elif setting['type'] == 'select':
        if not '1' in setting['actions']:
            raise ValueError('Select settings must declar an action for "1" to have any effect.')

    # Apply the defaults.
    if not 'section' in setting:
        setting['section'] = 'general'

    if not 'default' in setting:
        setting['default'] = False

    if not 'description' in setting:
        setting['description'] = ''

    # Give a relative path to the files in the actions section that the settings system can understand
    # what URL to load when it takes an action
    for action in setting['actions']:
        i = 0
        while i < len(setting['actions'][action]):
            currentAction = setting['actions'][action][i]

            if currentAction == 'injectCSS' or currentAction == 'injectScript':
                fullPath = os.path.join(dirName, setting['actions'][action][i + 1])

                # Convert to / if we're on Windows
                fullPath = urllib.pathname2url(fullPath)

                fullPath = fullPath.replace("./src/common/", "")

                setting['actions'][action][i + 1] = fullPath

            i += 2

def checkSettingStructure(setting, dirName):
    if isinstance(setting, dict):
        checkIndividualSetting(setting, dirName)
    elif isinstance(setting, list):
        for individualSetting in setting:
            checkIndividualSetting(individualSetting, dirName)
    else:
        raise ValueError('Settings must be a single JSON object or an array of JSON objects. See the setting file in hide-age-of-money for an example setting.')



for dirName, subdirList, fileList in os.walk('./src/common/res/features/'):

    if ('settings.json' in fileList):
        with open(os.path.join(dirName, 'settings.json'), 'r') as settingsFile:
            settingsContents = json.loads(settingsFile.read())

            # Validate first
            try:
                checkSettingStructure(settingsContents, dirName)
            except ValueError:
                formatted_lines = traceback.format_exc().splitlines()
                print "[  ERROR] Settings error: {0}".format(formatted_lines[-1])
                print "[  ERROR] While processing file: {0}".format(settingsFile.name)
                print "--------------------------------------------------------------------------------"
                print "[  ERROR] EXTENSION WAS NOT BUILT. Please fix the settings errors and try again."
                print "--------------------------------------------------------------------------------"
                print ""
                exit(1)

            # Ok, we're happy, add it to the output.
            if isinstance(settingsContents, dict):
                if not 'hidden' in settingsContents or not settingsContents['hidden']:
                    allSettings.append(settingsContents)
            else:
                for setting in settingsContents:
                    if not 'hidden' in settingsContents or not settingsContents['hidden']:
                        allSettings.append(setting)

    if ('init.js' in fileList):
        with open(os.path.join(dirName, 'init.js'), 'r') as initFile:
            allInitContent.append(initFile.read())


# Write the settings file with some helper functions
with open('./src/common/res/features/allSettings.js', 'w') as settingsFile:
    settingsFile.write(('/**********************************************************\n'
                        '* Warning: This is a file generated by the build process. *\n'
                        '*                                                         *\n'
                        '* Any changes you make manually will be overwritten       *\n'
                        '* the next time you run ./build or build.bat!             *\n'
                        '**********************************************************/\n\n'))
    settingsFile.write('if (typeof window.ynabToolKit === "undefined") { window.ynabToolKit = {}; }\n')

    settingsFile.write('''
    function getKangoSetting(settingName) {

      return new Promise(function(resolve, reject) {
        kango.invokeAsync('kango.storage.getItem', settingName, function(data) {
          resolve(data);
        });
      });
    }

    function setKangoSetting(settingName, data) {
      return new Promise(function(resolve, reject) {
        kango.invokeAsync('kango.storage.setItem', settingName, data, function(data) {
          resolve("success");
        });
      });
    }

    function getKangoStorageKeys() {
      return new Promise(function(resolve, reject) {
        kango.invokeAsync('kango.storage.getKeys', function(keys) {
          resolve(keys);
        });
      });
    }

    function ensureDefaultsAreSet() {
      return new Promise(function(resolve, reject) {
        getKangoStorageKeys().then(function(storedKeys) {

          var promises = [];

          ynabToolKit.allSettings.forEach(function(setting) {
            if (storedKeys.indexOf(setting.name) < 0) {
              promises.push(setKangoSetting(setting.name, setting.default));
            }
          });

          Promise.all(promises).then(function() {
            resolve();
          });
        });
      });
    }\n\n''')

    settingsFile.write('window.ynabToolKit.allSettings = ' + json.dumps(allSettings))


# Write the init file:
with open('./src/common/res/features/allInits.js', 'w') as allInits:
    allInits.write(('/**********************************************************\n'
                    '* Warning: This is a file generated by the build process. *\n'
                    '*                                                         *\n'
                    '* Any changes you make manually will be overwritten       *\n'
                    '* the next time you run ./build or build.bat!             *\n'
                    '**********************************************************/\n\n'))
    allInits.write('\n'.join(allInitContent))

print('[   INFO] All inits and settings written correctly')
