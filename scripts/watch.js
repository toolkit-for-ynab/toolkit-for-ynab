const spawn = require('child_process').spawn;
let buildProcesses = [];

var watcher = require('chokidar').watch([
  'src/**'
], {
  persistent: true,
  ignoreInitial: true,
  ignored: [
    // all generated files need to be ignored
    'src/extension/features/index.js',
    'src/core/settings/settings.js',
    'src/**/feedChanges.js'
  ]
});

watcher.on('all', function (event, path) {
  console.log(`Changes detected (${path}), rebuilding...`);

  if (buildProcesses.length) {
    buildProcesses.forEach(proc => proc.kill());
  }

  spawnBuildProcess();
});

function spawnBuildProcess() {
  const yarnCLI = /^win/.test(process.platform) ? 'yarn.cmd' : 'yarn';
  const buildProcess = spawn(yarnCLI, ['build'], {
    stdio: [0, 1, 2]
  });

  buildProcess.on('close', (data) => {
    if (data !== 0 && data !== null) {
      console.log('Process exited with non-zero, retrying...');
      spawnBuildProcess();
    }

    buildProcesses.splice(buildProcesses.indexOf(buildProcess), 1);
  });

  buildProcesses.push(buildProcess);
}

spawnBuildProcess();
