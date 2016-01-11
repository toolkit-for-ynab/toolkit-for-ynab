import re
import codecs
from abc import ABCMeta, abstractmethod
from kango.utils import replace_file_content


class BuildStepBase(object):
    __metaclass__ = ABCMeta

    def _get_userscript_header(self, path):
        with open(path, 'r') as f:
            content = f.read()
            header = re.search('// ==UserScript==(.*)// ==/UserScript==', content, flags=re.IGNORECASE | re.DOTALL)
            if header is not None:
                return header.group(0)
            return None

    def _add_text_to_beginning(self, path, text):
        replace_file_content(path, lambda c: text + c)

    @abstractmethod
    def pre_pack(self, output_path, project_path, info, args):
        pass
