import { observeListener, routeChangeListener } from 'toolkit/extension/listeners';
import { logToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { SupportedEmberHook } from '../ynab-toolkit';
import { addToolkitEmberHook, removeToolkitEmberHook } from '../utils/toolkit';

export class Feature {
  private __hooks = new Map<string, (element: HTMLElement) => void>();
  featureName = this.constructor.name as FeatureName;

  settings = {
    enabled: ynabToolKit.options[this.featureName],
  };

  shouldInvoke(): boolean {
    // Default to no action. Unless you're implementing a CSS only feature,
    // you MUST override this to specify when your invoke() function should run!
    return false;
  }

  willInvoke(): void | Promise<void> {
    /* stubbed optional hook for logic that must happen for a feature
    to work but doesn't need to happen on every invoke */
  }

  invoke(): void {
    throw Error(`Feature: ${this.featureName} does not implement required invoke() method.`);
  }

  destroy(): void {
    /* stubbed, allows feature to add additional destroy functionality */
  }

  injectCSS(): string {
    /* stubbed, default to no injected CSS */
    return '';
  }

  logError(exception: Error): void {
    logToolkitError({
      exception,
      featureName: this.featureName,
      featureSetting: this.settings.enabled,
    });
  }

  observe(): void {
    /* stubbed listener function */
  }

  onRouteChanged(): void {
    /* stubbed listener function */
  }

  onBudgetChanged(): void {
    /* stubbed listener function */
  }

  applyListeners(): void {
    observeListener.addFeature(this);
    routeChangeListener.addFeature(this);
  }

  removeListeners(): void {
    observeListener.removeFeature(this);
    routeChangeListener.removeFeature(this);
  }

  addToolkitEmberHook(
    componentKey: string,
    lifecycleHook: SupportedEmberHook,
    fn: (element: HTMLElement) => void
  ): void {
    addToolkitEmberHook(this, componentKey, lifecycleHook, fn);
    this.__hooks.set(`${componentKey}:${lifecycleHook}`, fn);
  }

  removeToolkitEmberHook(
    componentKey: string,
    lifecycleHook: SupportedEmberHook,
    fn: (element: HTMLElement) => void
  ): void {
    removeToolkitEmberHook(componentKey, lifecycleHook, fn);
    this.__hooks.delete(`${componentKey}:${lifecycleHook}`);
  }

  removeToolkitEmberHooks(): void {
    this.__hooks.forEach((fn, key) => {
      const [componentKey, lifecycleHook] = key.split(':') as [string, SupportedEmberHook];
      this.removeToolkitEmberHook(componentKey, lifecycleHook, fn);
    });
  }
}
