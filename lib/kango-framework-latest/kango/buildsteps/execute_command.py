import os
import subprocess
from kango.buildsteps import BuildStepBase


class BuildStep(BuildStepBase):

    _allowed_extensions = ('.sh', '.bat', '.cmd')

    def _execute_command(self, command_path, working_path):
        original_dir = os.getcwd()
        os.chdir(working_path)
        subprocess.call(command_path)
        os.chdir(original_dir)

    def _execute(self, steps_path, working_path):
        files = os.listdir(steps_path)
        for filename in files:
            path = os.path.join(steps_path, filename)
            if os.path.isfile(path):
                extension = os.path.splitext(path)[1]
                if extension in self._allowed_extensions:
                    self._execute_command(os.path.abspath(path), working_path)

    def pre_pack(self, output_path, project_path, info, args):
        steps_path = os.path.join(project_path, 'buildsteps')
        if os.path.isdir(steps_path):
            self._execute(steps_path, output_path)
