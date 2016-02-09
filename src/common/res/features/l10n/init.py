#!/usr/bin/env python
"""Prepare and download l10ns."""
import urllib2
import shutil
import os
import zipfile
import json

ID = 'toolkit-for-ynab'
KEY = '0670e2d9a5d34c0f3603f690a181d0a0'
API_PREFIX = 'https://api.crowdin.com/api/project/%s/' % ID
KEY_SUFFIX = '?key=%s' % KEY
FILENAME = 'all.zip'
DEST_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'locales')

def export_l10ns():
    """Force crowding to export l10ns."""
    url = API_PREFIX + 'export' + KEY_SUFFIX
    response = urllib2.urlopen(url)
    html = response.read()
    return (html.find('success status') >= 0)

def donwload_l10ns():
    """Download all l10ns in zip archive."""
    url = API_PREFIX + 'download/' + FILENAME + KEY_SUFFIX
    l10ns_file = urllib2.urlopen(url)
    with open('all.zip','wb') as f:
        f.write(l10ns_file.read())
    return True

def unpack():
    """Unpack l10ns, move to one folder, add js initializer."""
    os.path.isdir(DEST_DIR) and shutil.rmtree(DEST_DIR)
    zipfile.ZipFile(FILENAME).extractall(DEST_DIR)
    for root, dirs, files in os.walk(DEST_DIR):
        for name in files:
            shutil.move(os.path.join(root, name), DEST_DIR)
            # Prepend all JSONs with Ember declaration.
            with open(os.path.join(DEST_DIR, name), 'r+') as f:
                content = f.read()
                f.seek(0, 0)
                f.write('ynabToolKit.l10nData = ' + content)
    for root, dirs, files in os.walk(DEST_DIR):
        for name in dirs:
            os.rmdir(os.path.join(root, name))
    os.remove(FILENAME)

def create_settings():
    """Generate settings.json file."""
    settings = {
         "name": "l10n",
         "type": "select",
      "default": "0",
      "section": "general",
        "title": "Localization of YNAB",
  "description": "Localization of interface.",
      "options": [
                { "name": "Default", "value": "0" }
             ],
      "actions": {}}
    for root, dirs, files in os.walk(DEST_DIR):
        for i, name in enumerate(files):
            value = str(i + 1)
            settings['options'].append({ "name": name.split('.')[0], "value": value })
            settings['actions'][value] = ["injectScript", "locales/" + name,
                                          "injectScript", "main.js"]
    with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'settings.json'), 'w') as f:
        json.dump(settings, f, indent=4)


export_l10ns()
donwload_l10ns()
unpack()
create_settings()
