# Kango - Cross-browser extension framework
# Extension builder
# http://kangoextensions.com/

import sys


def main():
    from kango.commands.processor import CommandLineProcessor
    CommandLineProcessor().process()

if __name__ == '__main__':
    version = tuple(sys.version_info[:2])
    if version < (2, 7) or version >= (3, 0):
        sys.stderr.write('Error: Python %d.%d is not supported. Please use version 2.7 or greater.\n' % version)
        sys.exit(1)
    
    main()