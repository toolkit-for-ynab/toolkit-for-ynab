#!/usr/bin/env python
"""Prepare and download l10ns."""
import urllib, urllib2
import shutil
import os
import zipfile
import json
import sys
import math

if len(sys.argv) != 2:
    print ''
    print 'ERROR:'
    print ''
    print 'Please supply a Crowdin API key, obtained on this page:'
    print 'http://translate.toolkitforynab.com/project/toolkit-for-ynab/settings#api\n'
    print 'Example: ./get_l10ns <api key>'
    print ''
    exit(1)

ID = 'toolkit-for-ynab'
KEY = sys.argv[1:][0]
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

def download_l10ns():
    """Download all l10ns in zip archive."""
    url = API_PREFIX + 'download/' + FILENAME + KEY_SUFFIX
    l10ns_file = urllib2.urlopen(url)
    with open('all.zip','wb') as f:
        f.write(l10ns_file.read())
    return True

def get_l10ns_stats():
    url = API_PREFIX + "status" + KEY_SUFFIX + "&json=true"
    response = urllib2.urlopen(url)
    j = response.read()
    lang_completed = {}
    for i in json.loads(j):
        lang_completed[i['name']] = int(math.ceil(int(i["words_translated"])/float(i["words"])*100))
    return lang_completed

def unpack(lang_completed):
    """Unpack l10ns, move to one folder, add js initializer."""
    os.path.isdir(DEST_DIR) and shutil.rmtree(DEST_DIR)
    zipfile.ZipFile(FILENAME).extractall(DEST_DIR)
    for root, dirs, files in os.walk(DEST_DIR):
        for name in files:
            if lang_completed[name.split('.')[0]] != 0:
                shutil.move(os.path.join(root, name), DEST_DIR)
                # Prepend all JSONs with Ember declaration.
                with open(os.path.join(DEST_DIR, name), 'r+') as f:
                    content = f.read()
                    f.seek(0, 0)
                    f.write('/* eslint-disable */\n// prettier-ignore\nynabToolKit.l10nData = ' + content + '\n')
    for root, dirs, files in os.walk(DEST_DIR):
        for name in dirs:
            shutil.rmtree(os.path.join(root, name))
    os.remove(FILENAME)

def rename():
    for root, dirs, files in os.walk(DEST_DIR):
        for name in files:
            inname = os.path.join(root,name)
            os.rename(inname, inname[:-5]+'.js')

def create_settings(lang_completed):
    """Generate settings.json file."""
    settings = {
        "name": "l10n",
        "type": "select",
        "default": "0",
        "section": "general",
        "title": "Localization of YNAB",
        "description": "Localization of interface.",
        "options": [{
            "name": "Default",
            "value": "0"
        }],
        "actions": {
            "0": ["injectScript", "default.js"]
        }
    }
    for root, dirs, files in os.walk(DEST_DIR):
        for name in files:
            if lang_completed[name.split('.')[0]] != 0:
                value = name.split('.')[0].lower()
                percent = ' (%s%%)' % str(int(lang_completed[name.split('.')[0]]))
                settings['options'].append({
                    "name": name.split('.')[0] + percent,
                    "value": value })
                settings['actions'][value] = ["injectScript", "locales/" + name,
                                              "injectScript", "main.js"]
    with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'settings.json'), 'wb') as f:
        json.dump(settings, f, indent=4)

lang_completed = get_l10ns_stats()
export_l10ns()
download_l10ns()
unpack(lang_completed)
rename()
create_settings(lang_completed)
