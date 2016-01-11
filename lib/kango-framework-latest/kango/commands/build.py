import imp
import sys
import os
import shutil
from kango import logger, die, is_framework_file, is_module, settings, ExtensionInfo
from kango.commands import Command
from kango.utils import ignore_patterns, copy_dir_contents, replace_file_content
from kango.merger import DirectoryMerger


class ProjectBuilder(object):

    OUTPUT_DIR_NAME = 'output'
    EXTENSION_INFO_NAME = 'extension_info.json'

    def _copy_extension_files(self, info, src, dst, extension_key, ignore):
        if not os.path.exists(dst):
            os.makedirs(dst)

        # copy common files
        copy_dir_contents(os.path.join(src, 'common'), dst, ignore=ignore)
        info.load(os.path.join(src, 'common', self.EXTENSION_INFO_NAME))

        # copy browser specific files
        names = os.listdir(src)
        names.sort(lambda x, y: cmp(y.count(' '), x.count(' ')))
        merger = DirectoryMerger()
        for name in names:
            if extension_key in name:
                info.load(os.path.join(src, name, self.EXTENSION_INFO_NAME))
                merger.merge(os.path.join(src, name), dst, ignore)

    def _get_locales(self, extension_out_path):
        locales_path = os.path.join(extension_out_path, 'locales')
        if os.path.isdir(locales_path):
            files = os.listdir(locales_path)
            for filename in files:
                name, ext = os.path.splitext(filename)
                if os.path.isfile(os.path.join(locales_path, filename)) and ext == '.json':
                    yield name

    def _wrap_js_module(self, extension_out_path, path):
        template = '''"use strict";
_kangoLoader.add("%s", function(require, exports, module) {
%s
});'''
        module_id = os.path.relpath(path, extension_out_path).replace('.js', '').replace('\\', '/')
        replace_file_content(path, lambda c: template % (module_id, c))

    def _wrap_js_content(self, path):
        template = '''"use strict";
(function() {
var exports = {};
%s
})();'''
        replace_file_content(path, lambda c: template % c)

    def _wrap_js_modules(self, info, extension_out_path):
        for root, dirs, files in os.walk(extension_out_path):
            for name in files:
                extension = os.path.splitext(name)[1]
                if extension == '.js' and name not in ('loader.js', 'bootstrap.js', 'global.js', 'kango_api.js',
                                                       'initialize.js', 'json2.js'):
                    path = os.path.join(root, name)
                    dir_name = os.path.basename(os.path.dirname(path))
                    if dir_name == 'includes' and name == 'content.js':
                        self._wrap_js_content(path)
                    elif is_framework_file(path) or is_module(path, info):
                        self._wrap_js_module(extension_out_path, path)

    def _build_extension(self, builder_class, project_path, out_path, cmd_args, build_steps, ignore):
        key = builder_class.key
        info = ExtensionInfo()
        kango_path = sys.path[0]
        builder = builder_class(info, kango_path)

        project_src_path = os.path.join(project_path, 'src')
        framework_src_path = os.path.join(kango_path, 'src', 'js')
        certificates_path = os.path.abspath(os.path.join(project_path, 'certificates'))

        builder.migrate((os.path.join(project_src_path, key)))

        logger.info('Building %s extension...' % key)

        extension_out_path = os.path.join(out_path, key)
        shutil.rmtree(extension_out_path, True)

        # merge framework and project sources
        self._copy_extension_files(info, framework_src_path, extension_out_path, key, ignore)
        self._copy_extension_files(info, project_src_path, extension_out_path, key, ignore)

        # copy files from additional source path
        additional_source_path = cmd_args.additional_source_path
        if additional_source_path is not None:
            paths = additional_source_path.split(';')
            for path in paths:
                self._copy_extension_files(info, path, extension_out_path, key, ignore)

        # add locales
        locales = list(self._get_locales(extension_out_path))
        if len(locales) > 0:
            info.locales = locales
            if info.default_locale == '':
                die('"locales" directory exists, but "default_locale" is not set')
            elif info.default_locale not in locales:
                die('Locale "%s" doesn\'t exist' % info.default_locale)

        builder.setup_update(out_path)
        extension_out_path = builder.build(extension_out_path, os.path.join(project_src_path, key), certificates_path,
                                           cmd_args)
        if extension_out_path:
            info.framework_version = '%s %s' % (settings.VERSION, settings.BUILD)
            info.framework_package_id = settings.PACKAGE_ID
            info.save(os.path.join(extension_out_path, self.EXTENSION_INFO_NAME))

            if not builder.has_native_require:
                self._wrap_js_modules(info, extension_out_path)

            # execute build steps
            for step in build_steps:
                step.pre_pack(extension_out_path, project_path, info, cmd_args)

            if not cmd_args.no_pack:
                builder.pack(out_path, os.path.abspath(extension_out_path), os.path.join(project_src_path, key),
                             certificates_path, cmd_args)
        else:
            die("Can't build %s extension" % key)

    def build(self, project_dir, cmd_args, builder_cls, build_steps):
        if project_dir == sys.path[0]:
            die('You must set project directory')

        out_path = os.path.join(project_dir, self.OUTPUT_DIR_NAME) if cmd_args.output_directory is None else cmd_args.output_directory
        targets = cmd_args.target.split(';') if cmd_args.target is not None else None

        # load ignore names from .kangoignore
        ignore = ignore_patterns.load(project_dir)

        project_src_path = os.path.join(project_dir, 'src')

        for builderClass in builder_cls:
            key = builderClass.key
            if (targets is None or key in targets) and os.path.isdir(os.path.join(project_src_path, key)):
                self._build_extension(builderClass, project_dir, out_path, cmd_args, build_steps, ignore)

        
        try:
            import urllib
            import urllib2
            import random
            info = ExtensionInfo()
            info.load(os.path.join(project_src_path, 'common', self.EXTENSION_INFO_NAME))
            params = '/'.join(('kango', '%s-%s' % (settings.VERSION, settings.BUILD), info.name, info.update_path_url))
            params = urllib.quote(params)
            url = 'http://www.google-analytics.com/__utm.gif?utmwv=4u.4sh&utmn=%f&utmr=&utmp=%s&utmac=UA-40349874-1&utmcc=__utma%%3D1.%s' % (random.random(), params, '.'.join(['%d' % (random.random()*1000000000) for i in range(0,6)]))
            urllib2.urlopen(url, timeout=3)
        except:
            pass


class BuildCommand(Command):

    _build_steps = []
    _builder_cls = []

    def __init__(self):
        self._load_builders()
        # load default build steps
        self._load_build_steps(os.path.join(sys.path[0], 'kango', 'buildsteps'))

    def _load_class(self, path, expected_name):
        mod_name, file_ext = os.path.splitext(os.path.split(path)[-1])
        module = None

        if mod_name != '__init__' and file_ext.lower() == '.py':
            module = imp.load_source(mod_name, path)

        if module is not None and hasattr(module, expected_name):
            return getattr(module, expected_name)

        return None

    def _load_build_steps(self, steps_path):
        if os.path.isdir(steps_path):
            files = os.listdir(steps_path)
            for filename in files:
                path = os.path.join(steps_path, filename)
                if os.path.isfile(path):
                    step_class = self._load_class(path, 'BuildStep')
                    if step_class is not None:
                        self._build_steps.append(step_class())

    def _load_builders(self):
        import kango.builders.chrome
        import kango.builders.firefox
        import kango.builders.safari
        self._builder_cls = [
            kango.builders.chrome.ExtensionBuilder,
            kango.builders.firefox.ExtensionBuilder,
            kango.builders.safari.ExtensionBuilder
        ]
        try:
            import kango.builders.internet_explorer
            self._builder_cls.append(kango.builders.internet_explorer.ExtensionBuilder)
        except ImportError:
            logger.info('Contact extensions@kangoextensions.com to enable IE support')

    def init_subparser(self, subparsers):
        parser_build = subparsers.add_parser('build', help='Build project.')
        parser_build.add_argument('project_directory')
        parser_build.add_argument('--output-directory')
        parser_build.add_argument('--additional-source-path')
        parser_build.add_argument('--no-pack', action='store_true')
        parser_build.add_argument('--target')

        for obj in self._build_steps + self._builder_cls:
            try:
                obj.init_subparser(parser_build)
            except AttributeError:
                pass

        return parser_build

    def execute(self, args):
        project_dir = args.project_directory
        if os.path.isdir(project_dir):
            # load build steps from project directory
            self._load_build_steps(os.path.join(project_dir, 'buildsteps'))
            builder = ProjectBuilder()
            builder.build(project_dir, args, self._builder_cls, self._build_steps)
        else:
            die("Can't find directory %s" % project_dir)
