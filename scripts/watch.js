const spawn = require('child_process').spawn;
const terminate = require('terminate');

function debounce(fn, timeout = 50) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  };
}

const debounceSpawn = debounce(spawnBuildProcess, 25);

const buildProcesses = [];
const watcher = require('chokidar').watch(['src/**'], {
  persistent: true,
  ignoreInitial: true,
  ignored: [
    // all generated files need to be ignored
    'src/extension/features/index.ts',
    'src/core/settings/settings.ts',
  ],
});

watcher.on('all', function (event, path) {
  console.log(`Changes detected (${path}), rebuilding...`);

  if (buildProcesses.length) {
    buildProcesses.forEach((proc) => {
      terminate(proc.pid);
    });
  }

  debounceSpawn();
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
