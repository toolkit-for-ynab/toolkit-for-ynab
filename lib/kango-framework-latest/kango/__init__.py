import json
import logging
import sys
import os

logger = logging.getLogger('kango')


def die(message):
    logger.error(message)
    sys.exit(1)


def is_framework_file(path):
    include_dirs = ('includes', 'kango', 'kango-ui')
    if os.path.isfile(path):
        dir_name = os.path.basename(os.path.dirname(path))
        return dir_name in include_dirs
    return False


def is_module(path, info):
    for module in info.modules:
        if path.replace(os.sep, '/').find(module + '.js') != -1:
            return True
    return False


class ExtensionInfo(object):

    # Common
    id = ''
    name = ''
    description = ''
    version = ''
    creator = ''
    homepage_url = ''
    content_scripts = []
    background_scripts = []
    settings = None
    browser_button = None
    toolbar = None
    update_url = ''
    update_path_url = ''
    debug = False
    modules = []
    locales = []
    default_locale = ''
    options_page = None
    context_menu_item = None
    permissions = {
        'tabs': True,
        'content_scripts': ['http://*/*', 'https://*/*'],
        'context_menu': True,
        'web_navigation': True,
        'notifications': False,
        'cookies': False,
        'xhr': ['http://*/*', 'https://*/*'],
        'native_messaging': False
    }

    # Safari
    developer_id = ''

    # IE deprecated
    bho_iid = ''
    toolbar_iid = ''
    bho_clsid = ''
    toolbar_clsid = ''
    libid = ''

    # IE
    com_objects = {}

    # Opera
    mail = ''

    # Firefox
    package_id = None

    # Chrome
    chrome_public_key = ''

    # Internal
    kango_version = None

    def merge_array(self, seq):
        result = []
        for s in seq:
            if s not in result:
                result.append(s)
        return result

    def load(self, filename):
        try:
            with open(filename, 'r') as f:
                try:
                    info = json.load(f, encoding='utf-8')
                    for key in info:
                        if key in ('background_scripts', 'content_scripts', 'modules'):
                            setattr(self, key, self.merge_array(getattr(self, key) + info[key]))
                        elif key == 'permissions':
                            self.permissions.update(info[key])
                        else:
                            setattr(self, key, info[key])
                    return True
                except ValueError:
                    die('Error parsing %s' % filename)
        except IOError:
            pass
        return False

    def save(self, filename):
        with open(filename, 'w') as f:
            json.dump(self.__dict__, f, skipkeys=True, indent=4)
