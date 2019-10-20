const spawn = require('child_process').spawn;
const terminate = require('terminate');

const buildProcesses = [];
const watcher = require('chokidar').watch(['src/**'], {
  persistent: true,
  ignoreInitial: true,
  ignored: [
    // all generated files need to be ignored
    'src/extension/features/index.js',
    'src/core/settings/settings.js',
    'src/**/feedChanges.js',
  ],
});

watcher.on('all', function(event, path) {
  console.log(`Changes detected (${path}), rebuilding...`);

  if (buildProcesses.length) {
    buildProcesses.forEach(proc => {
      terminate(proc.pid);
    });
  }

  spawnBuildProcess();
});

function spawnBuildProcess() {
  const yarnCLI = /^win/.test(process.platform) ? 'yarn.cmd' : 'yarn';
  const buildProcess = spawn(yarnCLI, ['build:development'], {
    stdio: 'inherit',
  });

  buildProcess.on('close', () => {
    console.log('Waiting for changes...');
    buildProcesses.splice(buildProcesses.indexOf(buildProcess), 1);
  });

  buildProcesses.push(buildProcess);
}

spawnBuildProcess();
