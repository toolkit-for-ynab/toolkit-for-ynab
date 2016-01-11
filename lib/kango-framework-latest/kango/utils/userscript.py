"""
User Script metadata block parser
"""

__all__ = ['parse']

BEGIN_MARK = '// ==UserScript=='
END_MARK = '// ==/UserScript=='
ARRAY_KEYS = ('include', 'exclude', 'match', 'require')
BOOLEAN_KEYS = ('all-frames',)

import re


def parse(file):
    header_exp = re.compile(r'// @(\S+)\s*(.*)')
    bool_exp = re.compile('^true')
    headers = {}
    for line in file:
        if line != END_MARK:
            matches = header_exp.match(line)
            if matches is not None:
                name, value = matches.group(1, 2)
                if name in ARRAY_KEYS:
                    headers[name] = headers.get(name, [])
                    headers[name].append(value)
                elif name in BOOLEAN_KEYS:
                    headers[name] = bool_exp.search(value) is not None
                else:
                    headers[name] = value
        else:
            break
    return headers