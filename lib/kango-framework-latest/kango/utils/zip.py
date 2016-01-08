"""
ZIP file helpers
"""

import os
import zipfile


def _pack(zip, arcname, dir_path):
    files = os.listdir(dir_path)
    for filename in files:
        path = os.path.join(dir_path, filename)
        name = os.path.join(arcname, filename)
        if os.path.isdir(path):
            _pack(zip, name, path)
        else:
            zip.write(path, name)


def pack_directory(dir_path, zip_path):
    zip = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED)
    _pack(zip, '', dir_path)
    zip.close()