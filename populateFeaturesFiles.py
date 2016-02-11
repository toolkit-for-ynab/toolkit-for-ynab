#!/usr/bin/env python
"""Assemble features from separate directories and prepare files for use in the browser."""
import os
import json
import traceback
import re
try:
    from urllib.request import pathname2url
except ImportError:
    from urllib import pathname2url

allSettings = []
allFeedChangesContent = set()
previousNames = set()


def checkIndividualSetting(setting, dirName):
    """Validate feature settings in a given dirName."""
    if 'name' not in setting:
        raise ValueError('Every setting must have a name property.')

    if setting['name'] in previousNames:
        raise ValueError('Duplicate setting name: ' + setting['name'])

    previousNames.add(setting['name'])

    if 'type' not in setting:
        raise ValueError('Every setting must have a type property.')

    if setting['type'] != 'checkbox' and setting['type'] != 'select':
        raise ValueError('Only checkbox and select settings are supported at this time. Pull requests are welcome!')

    if 'title' not in setting:
        raise ValueError('Every setting must have a title.')

    if 'actions' not in setting:
        raise ValueError('Every setting must declare actions that happen when the setting is activated.')

    for action in setting['actions']:
        if not isinstance(setting['actions'][action], list):
            raise ValueError('Actions must be declared as an array, for example ["injectCSS", "main.css"].')

        if len(setting['actions'][action]) % 2 != 0:
            raise ValueError('Actions must have an even number of elements, for example ["injectCSS", "main.css"].')

    if setting['type'] == 'checkbox':
        if 'true' not in setting['actions'] and 'false' not in setting['actions']:
            raise ValueError('Checkbox settings must declare an action for "true" or "false" to have any effect.')
    elif setting['type'] == 'select':
        if '1' not in setting['actions']:
            raise ValueError('Select settings must declare an action for "1" to have any effect.')

    # Apply the defaults.
    if 'section' not in setting:
        setting['section'] = 'general'

    if 'default' not in setting:
        setting['default'] = False

    if 'description' not in setting:
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
                fullPath = pathname2url(fullPath)

                fullPath = fullPath.replace("./src/common/", "")

                setting['actions'][action][i + 1] = fullPath

            i += 2


def checkSettingStructure(setting, dirName):
    """Validate the structure of a given setting or group of settings."""
    if isinstance(setting, dict):
        checkIndividualSetting(setting, dirName)
    elif isinstance(setting, list):
        for individualSetting in setting:
            checkIndividualSetting(individualSetting, dirName)
    else:
        raise ValueError('Settings must be a single JSON object or an array of JSON objects. '
                         'See the setting file in hide-age-of-money for an example setting.')

for dirName, subdirList, fileList in os.walk('./src/common/res/features/'):

    if ('settings.json' in fileList):
        with open(os.path.join(dirName, 'settings.json'), 'r') as settingsFile:
            settingsContents = json.loads(settingsFile.read())

            # Validate first
            try:
                checkSettingStructure(settingsContents, dirName)
            except ValueError:
                formatted_lines = traceback.format_exc().splitlines()
                print("[  ERROR] Settings error: {0}".format(formatted_lines[-1]))
                print("[  ERROR] While processing file: {0}".format(settingsFile.name))
                print("--------------------------------------------------------------------------------")
                print("[  ERROR] EXTENSION WAS NOT BUILT. Please fix the settings errors and try again.")
                print("--------------------------------------------------------------------------------")
                print("")
                exit(1)

            # Ok, we're happy, add it to the output.
            if isinstance(settingsContents, dict):
                if 'hidden' not in settingsContents or not settingsContents['hidden']:
                    allSettings.append(settingsContents)
            else:
                for setting in settingsContents:
                    if 'hidden' not in settingsContents or not settingsContents['hidden']:
                        allSettings.append(setting)

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

          ynabToolKit.settings.forEach(function(setting) {
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

    settingsFile.write('window.ynabToolKit.settings = ' + json.dumps(allSettings) + ';')

# Write the feedChanges file
pattern = re.compile(r"^[\s]*(ynabToolKit\..+?)[\s]*=[\s]*(new\s+)*function.*$", re.MULTILINE)

for dirName, subdirList, fileList in os.walk('./src/common/res/features/'):
    if dirName.endswith('shared'):
        continue

    jsFiles = [f for f in fileList if f.endswith('.js')]

    for jsFile in jsFiles:

        with open(os.path.join(dirName, jsFile), 'r') as content_file:
            content = content_file.read()
            result = pattern.search(content)

            if result:
                allFeedChangesContent.add(result.group(1))

with open('./src/common/res/features/act-on-change/feedChanges.js', 'w') as feedChanges:
    feedChanges.write(('/**********************************************************\n'
                       '* Warning: This is a file generated by the build process. *\n'
                       '*                                                         *\n'
                       '* Any changes you make manually will be overwritten       *\n'
                       '* the next time you run ./build or build.bat!             *\n'
                       '**********************************************************/\n\n'))

    feedChanges.write(('(function poll() {\n'
                       '  if (typeof ynabToolKit.shared !== \'undefined\') {\n\n'
                       '    ynabToolKit.shared.feedChanges = function(changedNodes) {\n\n'
                       '      // Python script auto builds up this list of features\n'
                       '      // that will use the mutation observer from actOnChange()\n\n'
                       '      // If a feature doesn\'t need to use observe(), we\n'
                       '      // just let it fail silently\n\n'))

    for feedChangesBlock in allFeedChangesContent:
        feedChanges.write('      try {\n')
        feedChanges.write('        ' + feedChangesBlock + '.observe(changedNodes);\n')
        feedChanges.write('      } catch (err) {/* ignore */}\n\n')

    feedChanges.write(('    };\n\n'
                       '  } else {\n'
                       '    setTimeout(poll, 100);\n'
                       '  }\n'
                       '})();\n'))

print('[   INFO] All inits and settings written correctly')
