from abc import ABCMeta, abstractmethod


class Command(object):
    __metaclass__ = ABCMeta

    @abstractmethod
    def init_subparser(self, subparsers):
        pass

    @abstractmethod
    def execute(self, args):
        pass
