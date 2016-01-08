"""
Ignore patterns
"""

import os
import fnmatch

DEFAULT_IGNORE_NAMES = ('.svn', '.hg', '.git', '.idea', '*.exp', '*.ilk', '*.lib', '.DS_Store')
DEFAULT_FILE_NAME = '.kangoignore'


def _load_names(path):
    names = []
    names.extend(DEFAULT_IGNORE_NAMES)
    try:
        for line in open(os.path.join(path, DEFAULT_FILE_NAME)):
            names.append(line.strip())
    except IOError:
        pass
    return names


def ignore_patterns_ex(*patterns):
    def _ignore_patterns(path, names):
        ignored_names = []
        for pattern in patterns:
            for name in names:
                if fnmatch.fnmatch(name, pattern) or fnmatch.fnmatch(os.path.join(path, name), pattern):
                    ignored_names.append(name)
        return set(ignored_names)
    return _ignore_patterns


def load(path):
    return ignore_patterns_ex(*_load_names(path))