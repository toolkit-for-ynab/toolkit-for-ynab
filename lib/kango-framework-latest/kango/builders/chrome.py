import struct
import os
import shutil
import sys
import json
import codecs
import subprocess
import xml
from array import array
from kango import logger, die
from kango.utils import zip as zip_file
from kango.builders import ExtensionBuilderBase
from kango.settings import KEYWORDS


class ExtensionBuilder(ExtensionBuilderBase):
    key = 'chrome'
    package_extension = '.crx'

    _manifest_filename = 'manifest.json'
    _background_host_filename = 'background.html'
    _info = None
    _kango_path = None
    _permission_table = {
        'context_menu': 'contextMenus',
        'web_navigation': 'webNavigation',
        'notifications': 'notifications',
        'cookies': 'cookies',
        'tabs': 'tabs',
        'native_messaging': 'nativeMessaging'
    }

    def __init__(self, info, kango_path):
        self._info = info
        self._kango_path = kango_path

    def _unix_find_app(self, prog_filename):
        bdirs = (
            '$HOME/Environment/local/bin/',
            '$HOME/bin/',
            '/share/apps/bin/',
            '/usr/local/bin/',
            '/usr/bin/'
        )
        for dir in bdirs:
            path = os.path.expandvars(os.path.join(dir, prog_filename))
            if os.path.exists(path):
                return path
        return None

    def get_chrome_path(self):
        if sys.platform.startswith('win'):
            root_pathes = (
                '${LOCALAPPDATA}',
                '${APPDATA}',
                '${ProgramFiles(x86)}',
                '${ProgramFiles}'
            )

            app_pathes = (os.path.join('Google', 'Chrome', 'Application', 'chrome.exe'),
                          os.path.join('Chromium', 'Application', 'chrome.exe'))

            for root_path in root_pathes:
                for app_path in app_pathes:
                    path = os.path.expandvars(os.path.join(root_path, app_path))
                    if os.path.exists(path):
                        return path

        elif sys.platform.startswith('linux'):
            for apppath in ('chromium-browser', 'google-chrome', 'chromium'):
                path = self._unix_find_app(apppath)
                if path is not None:
                    return path

        elif sys.platform.startswith('darwin'):
            if os.path.exists('/Applications/Google Chrome.app'):
                return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            elif os.path.exists('/Applications/Chromium.app'):
                return '/Applications/Chromium.app/Contents/MacOS/Chromium'
        return None

    def _load_manifest(self, manifest_path):
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
            return manifest

    def _save_manifest(self, manifest, manifest_path):
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, skipkeys=True, indent=4)

    def _patch_manifest(self, info, manifest):
        if info.update_url == '':
            del manifest['update_url']

        if info.homepage_url == '':
            del manifest['homepage_url']

        if info.chrome_public_key != '':
            manifest['key'] = info.chrome_public_key

        for elem in manifest:
            if elem not in('content_scripts', 'permissions') and hasattr(info, elem):
                manifest[elem] = getattr(info, elem)

        if info.browser_button is None:
            del manifest['browser_action']
        else:
            manifest['browser_action']['default_icon'] = info.browser_button['icon']
            manifest['browser_action']['default_title'] = info.browser_button['tooltipText']
            if 'popup' not in info.browser_button:
                del manifest['browser_action']['default_popup']

        if not info.content_scripts:
            del manifest['content_scripts']

        if info.options_page is None:
            del manifest['options_page']

        if info.context_menu_item is None and 'context_menu' not in info.permissions:
            manifest['permissions'].remove('contextMenus')

        if info.permissions['xhr'] != self.DEFAULT_XHR_PERMISSIONS:
            for key in self.DEFAULT_XHR_PERMISSIONS:
                manifest['permissions'].remove(key)
            manifest['permissions'].extend(info.permissions['xhr'])

        if info.permissions['content_scripts'] != self.DEFAULT_CONTENT_SCRIPTS_MATCHES:
            manifest['content_scripts'][0]['matches'] = info.permissions['content_scripts']

        for key in self._permission_table:
            if not info.permissions[key]:
                manifest['permissions'].remove(self._permission_table[key])

    def _process_includes(self, manifest, out_path):
        includes_path = os.path.join(out_path, 'includes')
        if 'content_scripts' in manifest:
            self.merge_files(os.path.join(includes_path, 'content.js'),
                             map(lambda path: os.path.join(out_path, path), manifest['content_scripts'][0]['js']))

            os.remove(os.path.join(includes_path, 'content_%s.js') % KEYWORDS['product'])

            manifest['content_scripts'][0]['js'] = ['includes/content.js']
        else:
            shutil.rmtree(includes_path, True)

    def _zip2crx(self, zipPath, keyPath, crxPath):
        """
        :param zipPath: path to .zip file
        :param keyPath: path to .pem file
        :param crxPath: path to .crx file to be created
        """
        # Sign the zip file with the private key in PEM format
        signature = subprocess.Popen(['openssl', 'sha1', '-sign', keyPath, zipPath], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()[0]

        # Convert the PEM key to DER (and extract the public form) for inclusion in the CRX header
        derkey = subprocess.Popen(['openssl', 'rsa', '-pubout', '-inform', 'PEM', '-outform', 'DER', '-in', keyPath], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()[0]

        with open(crxPath, 'wb') as out:
            out.write('Cr24')  # Extension file magic number

            header = array('L') if struct.calcsize('L') == 4 else array('I')

            header.append(2)  # Version 2
            header.append(len(derkey))
            header.append(len(signature))
            header.tofile(out)
            out.write(derkey)
            out.write(signature)
            with open(zipPath, 'rb') as zipFile:
                out.write(zipFile.read())

    def _generate_private_key(self, keyPath):
        subprocess.Popen(['openssl', 'genrsa', '-out', './out.pem', '1024'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
        subprocess.Popen(['openssl', 'pkey', '-in', './out.pem', '-out', keyPath], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
        os.remove('./out.pem')

    def _pack_via_open_ssl(self, zipPath, keyPath, crxPath):
        if not os.path.isfile(keyPath):
            self._generate_private_key(keyPath)
        self._zip2crx(zipPath, keyPath, crxPath)

    def _pack_zip(self, dst, src):
        filename = self.get_package_name(self._info) + '_chrome_webstore.zip'
        outpath = os.path.abspath(os.path.join(dst, filename))
        zip_file.pack_directory(src, outpath)
        return outpath

    def _build_locales(self, manifest, out_path):
        if len(self._info.locales) > 0:
            special_keys = ('name', 'description')
            locale_keys = ['__info_%s__' % key for key in special_keys]
            chrome_keys = ['info_%s' % key for key in special_keys]
            locales = self.get_locales(self._info.locales, out_path)
            for name, locale in locales:
                chrome_locale = {}
                for key, locale_key, chrome_key in zip(special_keys, locale_keys, chrome_keys):
                    if locale_key in locale:
                        chrome_locale[chrome_key] = {'message': locale[locale_key]}
                        manifest[key] = '__MSG_%s__' % chrome_key
                locale_dir = os.path.join(out_path, '_locales', name)
                os.makedirs(locale_dir)
                with open(os.path.join(locale_dir, 'messages.json'), 'w') as f:
                    json.dump(chrome_locale, f, skipkeys=True, indent=4)
                manifest['default_locale'] = self._info.default_locale

    def _validate(self, info):
        if len(info.description) > 132:
            logger.warning('description should be no more than 132 characters')

        if info.context_menu_item is not None and not info.permissions['context_menu']:
            die('context_menu_item used, but permissions.context_menu set to false')

    def build(self, out_path, project_src_path, certificates_path, cmd_args):
        self._validate(self._info)
        manifest_path = os.path.join(out_path, self._manifest_filename)
        manifest = self._load_manifest(manifest_path)
        self._patch_manifest(self._info, manifest)
        self._build_locales(manifest, out_path)
        self._process_includes(manifest, out_path)
        self._save_manifest(manifest, manifest_path)
        self.patch_background_host(os.path.join(out_path, self._background_host_filename), self._info.modules)
        return out_path

    def pack(self, output_path, extension_path, project_src_path, certificates_path, cmd_args):
        if not os.path.exists(certificates_path):
            os.makedirs(certificates_path)
        pem_path = os.path.join(certificates_path, 'chrome.pem')
        extension_dst = os.path.abspath(os.path.join(extension_path, '../', 'chrome.crx'))

        crx_path = os.path.join(output_path, self.get_full_package_name(self._info))

        chrome_path = self.get_chrome_path()
        if chrome_path is not None:
            args = [chrome_path, '--pack-extension=%s' % extension_path, '--no-message-box']
            if os.path.isfile(pem_path):
                args.append('--pack-extension-key=%s' % pem_path)

            subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

            try:
                shutil.move(os.path.abspath(os.path.join(extension_path, '../', 'chrome.pem')), pem_path)
            except:
                pass

            shutil.move(extension_dst, crx_path)
        else:
            logger.info('Chrome/Chromium is not installed, trying OpenSSL...')
            try:
                zip_path = self._pack_zip(output_path, extension_path)
                self._pack_via_open_ssl(zip_path, pem_path, crx_path)
            except:
                logger.error("Can't build extension with OpenSSL")

        if self._info.update_url != '':
            manifest_path = os.path.join(extension_path, self._manifest_filename)
            manifest = self._load_manifest(manifest_path)
            del manifest['update_url']
            self._save_manifest(manifest, manifest_path)

        self._pack_zip(output_path, extension_path)

    def setup_update(self, output_path):
        if self._info.update_url != '' or self._info.update_path_url != '':
            update_xml_filename = 'update_chrome.xml'
            xml_path = os.path.join(self._kango_path, 'src', 'xml', update_xml_filename)

            doc = xml.dom.minidom.parse(xml_path)
            app = doc.getElementsByTagName('app')[0]
            app.setAttribute('appid', self._info.id)
            updatecheck = app.getElementsByTagName('updatecheck')[0]
            updatecheck.setAttribute('codebase', self._info.update_path_url + self.get_full_package_name(self._info))
            updatecheck.setAttribute('version', self._info.version)

            with codecs.open(os.path.join(output_path, update_xml_filename), 'w', 'utf-8') as f:
                doc.writexml(f, encoding='utf-8')

            self._info.update_url = self._info.update_url if self._info.update_url != '' else self._info.update_path_url + update_xml_filename

    def migrate(self, src_path):
        pass
