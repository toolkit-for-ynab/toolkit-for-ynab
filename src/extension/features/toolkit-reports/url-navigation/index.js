import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class ToolkitReportsURLNavigation extends Feature {
  shouldInvoke() {
    // Check if URL navigation is enabled in settings
    return getToolkitStorageKey('ToolkitReportsURLNavigation', false);
  }

  invoke() {
    // This feature doesn't need to do anything on its own
    // The URL navigation functionality is handled by the main ToolkitReports feature
    // This just acts as a gate to enable/disable that functionality
  }

  onRouteChanged() {
    // No action needed
  }
}
