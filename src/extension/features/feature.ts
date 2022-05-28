import { observeListener, routeChangeListener } from 'toolkit/extension/ynab-toolkit';
import { logToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { boolean } from 'yargs';

export class Feature {
  private __hooks = new Map<string, (element: HTMLElement) => void>();
  featureName = this.constructor.name as FeatureName;

  settings = {
    enabled: ynabToolKit.options[this.featureName],
  };

  shouldInvoke(): boolean {
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

  onElement(
    selector: string,
    fn: (element: Element) => void,
    options?: {
      guard?: string;
    }
  ) {
    const element = document.querySelector(selector);
    if (element !== null) {
      if (options?.guard && element.querySelector(options.guard) !== null) {
        return;
      }

      fn.call(this, element);
    }
  }

  onElements(
    selector: string,
    fn: (element: Element) => void,
    options?: {
      guard?: string;
    }
  ) {
    const elements = document.querySelectorAll(selector);
    Array.from(elements).forEach((element) => {
      if (element !== null) {
        if (options?.guard && element.querySelector(options.guard) !== null) {
          return;
        }
      }

      fn.call(this, element);
    });
  }

  addToolkitEmberHook() {
    console.warn('todo: fix');
  }
}
