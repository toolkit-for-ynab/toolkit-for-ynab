import { observeListener, routeChangeListener } from 'toolkit/extension/ynab-toolkit';
import { logToolkitError, withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { SupportedEmberHook } from '../ynab-toolkit';
import { addToolkitEmberHook, removeToolkitEmberHook } from '../utils/toolkit';
import { forEachRenderedComponent } from '../utils/ember';

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

  debounce(fn: (element: HTMLElement) => void, timeout: number): (element: HTMLElement) => void {
    const timers = new Map<string, number>();
    return (element: HTMLElement) => {
      if (timers.has(element.id)) {
        window.clearTimeout(timers.get(element.id));
      }

      timers.set(
        element.id,
        window.setTimeout(() => {
          fn.call(this, element);
        }, timeout)
      );
    };
  }

  addToolkitEmberHook(
    componentKey: string,
    lifecycleHook: SupportedEmberHook,
    fn: (element: HTMLElement) => void,
    options?: { debounce?: number; guard?: (element: HTMLElement) => boolean }
  ): void {
    const wrappedAddToolkitEmberHook = withToolkitError(() => {
      if (options?.debounce != null) {
        fn = this.debounce(fn, options.debounce);
      }

      addToolkitEmberHook(this, componentKey, lifecycleHook, fn, options?.guard);

      this.__hooks.set(`${componentKey}:${lifecycleHook}`, fn);

      forEachRenderedComponent(componentKey, (view: { element: HTMLElement }) => {
        if (view.element) {
          if (options?.guard && !options.guard(view.element)) {
            return;
          }

          fn.call(this, view.element);
        }
      });
    }, this.featureName);

    wrappedAddToolkitEmberHook();
  }

  removeToolkitEmberHook(
    componentKey: string,
    lifecycleHook: SupportedEmberHook,
    fn: (element: HTMLElement) => void
  ): void {
    const wrappedRemoveToolkitEmberHook = withToolkitError(() => {
      removeToolkitEmberHook(componentKey, lifecycleHook, fn);
      this.__hooks.delete(`${componentKey}:${lifecycleHook}`);
    }, this.featureName);

    wrappedRemoveToolkitEmberHook();
  }

  removeToolkitEmberHooks(): void {
    this.__hooks.forEach((fn, key) => {
      const [componentKey, lifecycleHook] = key.split(':') as [string, SupportedEmberHook];
      this.removeToolkitEmberHook(componentKey, lifecycleHook, fn);
    });
  }
}
