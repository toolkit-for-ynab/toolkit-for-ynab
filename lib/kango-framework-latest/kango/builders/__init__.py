import os
import codecs
import json
from abc import ABCMeta, abstractmethod
from kango.utils import replace_file_content


class ExtensionBuilderBase(object):
    __metaclass__ = ABCMeta

    key = ''
    package_extension = ''
    has_native_require = False

    DEFAULT_CONTENT_SCRIPTS_MATCHES = ['http://*/*', 'https://*/*']
    DEFAULT_XHR_PERMISSIONS = ['http://*/*', 'https://*/*']

    @staticmethod
    def init_subparser(parser_build):
        pass

    @abstractmethod
    def build(self, output_path, project_src_path, certificates_path, cmd_args):
        pass

    @abstractmethod
    def pack(self, output_path, extension_path, project_src_path, certificates_path, cmd_args):
        pass

    @abstractmethod
    def setup_update(self, output_path):
        pass

    @abstractmethod
    def migrate(self, src_path):
        pass

    def get_domain_from_id(self, info):
        return (''.join(filter(lambda x: (x.isalpha() or x.isdigit() or x == '-'), info.id))).lower()

    def get_package_name(self, info):
        return (''.join(filter(lambda x: x.isalpha(), info.name)) + '_' + info.version).lower()

    def get_full_package_name(self, info):
            return self.get_package_name(info) + self.package_extension

    def insert_modules(self, text, modules):
        placeholder_sign = '<!-- MODULES_PLACEHOLDER -->'
        content = '<!-- Modules -->\n'
        for module in modules:
            content += '<script src="{}.js" type="text/javascript"></script>\n'.format(module)
        return text.replace(placeholder_sign, content)

    def patch_background_host(self, path, modules):
        replace_file_content(path, lambda c: self.insert_modules(c, modules))

    def merge_files(self, out_path, scripts):
        encoding = 'utf-8-sig'
        content = ''
        for script in scripts:
            with codecs.open(script, 'r', encoding) as f:
                content += f.read() + '\n'
        with codecs.open(out_path, 'w', encoding) as f:
            f.write(content)

    def get_locales(self, locale_names, out_path):
        for name in locale_names:
            with codecs.open(os.path.join(out_path, 'locales', ('%s.json' % name)), 'r', 'utf-8-sig') as f:
                locale = json.load(f, encoding='utf-8')
                yield name, locale
