#!/usr/bin/env ts-node

/**
 * Complete Safari build script
 *
 * This script:
 * 1. Builds the web extension (yarn build:safari)
 * 2. Syncs version numbers
 * 3. Copies resources to Safari project
 * 4. Optionally generates Xcode project (requires xcodegen on macOS)
 * 5. Optionally builds the app (requires xcodebuild on macOS)
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { WORKSPACE_ROOT } from '../lib/paths';

interface BuildOptions {
  skipWebBuild: boolean;
  generateXcode: boolean;
  buildApp: boolean;
  configuration: 'Debug' | 'Release';
  teamId?: string;
}

function run(command: string, cwd: string = WORKSPACE_ROOT): void {
  console.log(`\n> ${command}\n`);
  execSync(command, { cwd, stdio: 'inherit' });
}

function commandExists(command: string): boolean {
  try {
    const result = spawnSync('which', [command], { encoding: 'utf-8' });
    return result.status === 0;
  } catch {
    return false;
  }
}

function isMacOS(): boolean {
  return process.platform === 'darwin';
}

async function main(): Promise<void> {
  const argv = await yargs
    .option('skip-web-build', {
      alias: 's',
      type: 'boolean',
      default: false,
      description: 'Skip building the web extension (use existing dist/)',
    })
    .option('generate-xcode', {
      alias: 'g',
      type: 'boolean',
      default: false,
      description: 'Generate Xcode project using xcodegen (macOS only)',
    })
    .option('build-app', {
      alias: 'b',
      type: 'boolean',
      default: false,
      description: 'Build the macOS app using xcodebuild (macOS only)',
    })
    .option('configuration', {
      alias: 'c',
      type: 'string',
      default: 'Debug',
      choices: ['Debug', 'Release'],
      description: 'Build configuration',
    })
    .option('team-id', {
      alias: 't',
      type: 'string',
      description: 'Apple Developer Team ID for signing',
    })
    .help()
    .parse();

  const options: BuildOptions = {
    skipWebBuild: argv['skip-web-build'] as boolean,
    generateXcode: argv['generate-xcode'] as boolean,
    buildApp: argv['build-app'] as boolean,
    configuration: argv.configuration as 'Debug' | 'Release',
    teamId: argv['team-id'] as string | undefined,
  };

  console.log('='.repeat(60));
  console.log('Safari Extension Build');
  console.log('='.repeat(60));

  // Step 1: Build web extension
  if (!options.skipWebBuild) {
    console.log('\n[1/4] Building web extension...');
    run('yarn build:safari');
  } else {
    console.log('\n[1/4] Skipping web extension build (using existing dist/)');

    // Verify dist exists
    const distPath = path.join(WORKSPACE_ROOT, 'dist', 'extension');
    if (!fs.existsSync(distPath)) {
      console.error('Error: dist/extension not found. Run without --skip-web-build first.');
      process.exit(1);
    }
  }

  // Step 2: Sync version
  console.log('\n[2/4] Syncing version numbers...');
  run('ts-node scripts/safari/syncVersion.ts');

  // Step 3: Copy resources
  console.log('\n[3/4] Copying extension resources...');
  run('ts-node scripts/safari/copyResources.ts');

  // Step 4: Generate Xcode project (macOS only)
  if (options.generateXcode) {
    console.log('\n[4/4] Generating Xcode project...');

    if (!isMacOS()) {
      console.warn('Warning: Xcode project generation is only available on macOS.');
      console.log('Skipping Xcode project generation.');
    } else if (!commandExists('xcodegen')) {
      console.error('Error: xcodegen not found. Install with: brew install xcodegen');
      process.exit(1);
    } else {
      const safariDir = path.join(WORKSPACE_ROOT, 'safari');
      run('xcodegen generate', safariDir);
      console.log('Xcode project generated: safari/Toolkit for YNAB.xcodeproj');
    }
  } else {
    console.log('\n[4/4] Skipping Xcode project generation (use --generate-xcode to enable)');
  }

  // Optional: Build app (macOS only)
  if (options.buildApp) {
    console.log('\n[Bonus] Building macOS app...');

    if (!isMacOS()) {
      console.error('Error: Building the app is only available on macOS.');
      process.exit(1);
    }

    if (!commandExists('xcodebuild')) {
      console.error('Error: xcodebuild not found. Install Xcode from the Mac App Store.');
      process.exit(1);
    }

    const xcodeproj = path.join(WORKSPACE_ROOT, 'safari', 'Toolkit for YNAB.xcodeproj');
    if (!fs.existsSync(xcodeproj)) {
      console.error('Error: Xcode project not found. Run with --generate-xcode first.');
      process.exit(1);
    }

    let buildCommand = `xcodebuild -project "${xcodeproj}" -scheme "Toolkit for YNAB" -configuration ${options.configuration}`;

    if (options.teamId) {
      buildCommand += ` DEVELOPMENT_TEAM=${options.teamId}`;
    }

    buildCommand += ' build';

    run(buildCommand);
    console.log('Build complete!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('Safari build complete!');
  console.log('='.repeat(60));

  if (!options.generateXcode && !options.buildApp) {
    console.log('\nNext steps (on macOS):');
    console.log('  1. cd safari');
    console.log('  2. xcodegen generate');
    console.log('  3. open "Toolkit for YNAB.xcodeproj"');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
