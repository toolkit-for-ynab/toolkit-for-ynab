import fs from 'fs';
import path from 'path';

export const WORKSPACE_ROOT = path.join(__dirname, '../../');
export const OUTPUT_DIRECTORY = path.join(WORKSPACE_ROOT, 'dist');
export const EXTENSION_DIRECTORY = path.join(OUTPUT_DIRECTORY, 'extension');

export function assertExtensionDirectoryExists() {
  if (!fs.existsSync(EXTENSION_DIRECTORY)) {
    throw new Error(
      "The dist/extension directory doesn't exist yet. Run `yarn build` to create it."
    );
  }
}
