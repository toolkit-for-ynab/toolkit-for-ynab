import fs from 'fs';
import path from 'path';

export const WORKSPACE_ROOT = path.join(__dirname, '../../');
export const OUTPUT_DIRECTORY = path.join(WORKSPACE_ROOT, 'dist');
export const EXTENSION_DIRECTORY = path.join(OUTPUT_DIRECTORY, 'extension');
export const MANIFEST_PATH = path.join(EXTENSION_DIRECTORY, 'manifest.json');
export const FEATURE_LIST_MD = path.join(WORKSPACE_ROOT, 'docs/feature-list.md');

export function assertExtensionDirectoryExists() {
  if (!fs.existsSync(EXTENSION_DIRECTORY)) {
    throw new Error(
      "The dist/extension directory doesn't exist yet. Run `yarn build` to create it."
    );
  }
}
