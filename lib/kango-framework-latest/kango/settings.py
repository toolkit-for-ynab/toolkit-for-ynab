import os
import json


VERSION = '1.7.9'
BUILD = 'e39b6ff2fcc8'
PACKAGE_ID = 'dev'

KEYWORDS = {
    "product": "kango",
    "ie.engine": "KangoEngine",
    "ie.bho": "KangoBHO"
}

try:
    with open(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'settings.json'), 'r') as f:
        settings = json.load(f)
        KEYWORDS.update(settings.get('keywords', {}))
except IOError:
    pass