import os
import shutil
import codecs


def makedirs(path):
    try:
        os.makedirs(path)
    except OSError:
        pass


def copy_dir_contents(src, dst, ignore=None):
    names = os.listdir(src)
    if ignore is not None:
        ignored_names = ignore(src, names)
    else:
        ignored_names = set()

    makedirs(dst)

    for name in names:
        if name in ignored_names:
            continue
        srcname = os.path.join(src, name)
        dstname = os.path.join(dst, name)

        if os.path.isdir(srcname):
            copy_dir_contents(srcname, dstname, ignore)
        else:
            try:
                shutil.copy(srcname, dstname)
            except IOError:
                pass


def move_dir_contents(src, dst, ignore=None):
    names = os.listdir(src)
    if ignore is not None:
        ignored_names = ignore(src, names)
    else:
        ignored_names = set()

    makedirs(dst)

    for name in names:
        if name in ignored_names:
            continue
        srcname = os.path.join(src, name)
        dstname = os.path.join(dst, name)

        if os.path.isdir(srcname):
            move_dir_contents(srcname, dstname, ignore)
            try:
                os.removedirs(srcname)
            except OSError:
                pass
        else:
            try:
                shutil.move(srcname, dstname)
            except IOError:
                pass


def replace_file_content(path, replacer, encoding='utf-8-sig'):
    with codecs.open(path, 'r+', encoding) as f:
        content = f.read()
        f.truncate(0)
        f.seek(0)
        f.write(replacer(content))