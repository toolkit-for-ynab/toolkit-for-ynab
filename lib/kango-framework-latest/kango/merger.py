import codecs
import os
import shutil
import json
from abc import ABCMeta, abstractmethod


class FileMerger(object):
    __metaclass__ = ABCMeta

    @abstractmethod
    def merge(self, first, second, dst):
        pass


class TextfileMerger(FileMerger):

    supported_extensions = ('.js',)

    def merge(self, first, second, dst):
        encoding = 'utf-8-sig'
        with codecs.open(first, 'r', encoding) as f1, codecs.open(second, 'r', encoding) as f2:
            content = f1.read()
            content += ('\r\n' * 8) + f2.read()
            with codecs.open(dst, 'w', encoding) as f:
                f.write(content)
        return True


class JsonMerger(FileMerger):

    supported_extensions = ('.json',)

    def merge(self, first, second, dst):
        encoding = 'utf-8'
        with open(first, 'r') as f1, open(second, 'r') as f2:
            obj1 = json.load(f1, encoding=encoding)
            obj2 = json.load(f2, encoding=encoding)

            for key in obj2:
                obj1[key] = obj2[key]

            with codecs.open(dst, 'w', encoding) as f:
                json.dump(obj1, f, skipkeys=True, indent=4)

        return True


class DirectoryMerger(object):

    _mergers = (TextfileMerger(), JsonMerger())
    _part_sign = '.part'

    def _get_file_merger(self, ext):
        for merger in self._mergers:
            if ext in merger.supported_extensions:
                return merger
        return None

    def _merge_files(self, src, dst_dir):
        name, ext = os.path.splitext(src)
        merger = self._get_file_merger(ext)
        if merger is not None:
            if self._part_sign in src:
                full_file_path = os.path.join(dst_dir, os.path.basename(src.replace(self._part_sign, '')))
                if os.path.isfile(full_file_path):
                    return merger.merge(full_file_path, src, full_file_path)
            else:
                part_file_path = os.path.join(dst_dir, os.path.basename(name + self._part_sign + ext))
                full_file_path = os.path.join(dst_dir, os.path.basename(src))
                if os.path.isfile(part_file_path):
                    if merger.merge(src, part_file_path, full_file_path):
                        os.remove(part_file_path)
                        return True
        return False

    def merge(self, src, dst, ignore):
        if not os.path.exists(dst):
            os.makedirs(dst)

        names = os.listdir(src)
        ignored_names = ignore(src, names)

        for name in names:
            if name not in ignored_names:
                src_name = os.path.join(src, name)
                dst_name = os.path.join(dst, name)
                if os.path.isdir(src_name):
                    self.merge(src_name, dst_name, ignore)
                else:
                    if not self._merge_files(src_name, dst):
                        shutil.copyfile(src_name, dst_name)
