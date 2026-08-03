import { withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';

const IGNORE_UPDATES = new Set([
  // every time you hover a budget row, one of these nodes change which is _just a lot_.
  'ynab-new-icon category-moves-moves-icon',
  'ynab-new-icon',
  'category-moves-moves-icon',
  'budget-table-cell-category-moves js-budget-toolbar-open-category-moves',
  'budget-table-cell-category-moves',
  'js-budget-toolbar-open-category-moves',
  'budget-table-cell-category-moves js-budget-toolbar-open-category-moves category-moves-hidden',
  'category-moves-hidden',
  // no feature reads these classes today, but if one ever needs to mutate a tooltip
  // after it opens, these suppressions will need to be revisited.
  'tooltip-content tooltip-visible',
  'tooltip-content',
  'tooltip-visible',
  // when you scroll on an accounts page :D
  'ynab-grid-container scrolling',
  'ynab-grid-container',
  'scrolling',
]);

// How many times a single feature's observe() can run within OBSERVE_LOOP_WINDOW_MS before
// we warn that it's likely stuck re-triggering itself (e.g. mutating the DOM in a way that
// satisfies its own trigger condition again, with nothing left to force a yield between calls).
const OBSERVE_LOOP_THRESHOLD = 30;
const OBSERVE_LOOP_WINDOW_MS = 250;

export class ObserveListener {
  lastChangedNodes = new Set();

  duplicateCount = 0;

  featureInvocationTimestamps = new Map();

  constructor() {
    this.features = [];

    let _MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let observer = new _MutationObserver((mutations) => {
      this.changedNodes = new Set();

      const addChangedNodes = (nodes) => {
        nodes.each((index, element) => {
          let nodeClass = $(element).attr('class') || '';
          nodeClass = nodeClass.replace(/ember-view/g, '').trim();
          if (nodeClass) {
            this.changedNodes.add(nodeClass);

            const nodeClasses = nodeClass.split(' ');
            nodeClasses.forEach((className) => {
              if (className) {
                this.changedNodes.add(className);
              }
            });
          }
        });
      };

      mutations.forEach((mutation) => {
        let newNodes = mutation.target;
        let addedNodes = mutation.addedNodes;
        let $nodes = $(newNodes);

        addChangedNodes($nodes);

        if (addedNodes) {
          let $addedNodes = $(addedNodes);
          addChangedNodes($addedNodes);
        }
      });

      const shouldIgnore =
        this.changedNodes.size === 0 ||
        Array.from(this.changedNodes).every((change) => IGNORE_UPDATES.has(change));

      if (!shouldIgnore) {
        this.debug();
        this.emitChanges();
      }
    });

    // This finally says 'Watch for changes' and only needs to be called the one time
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  debug() {
    if (ynabToolKit.environment !== 'development') {
      return;
    }

    console.debug('Changed nodes', this.changedNodes);

    if (this.changedNodes.size !== this.lastChangedNodes.size) {
      this.lastChangedNodes = this.changedNodes;
      this.duplicateCount = 0;
      return;
    }

    const isDuplicate = Array.from(this.changedNodes).every((element) =>
      this.lastChangedNodes.has(element),
    );
    if (isDuplicate && ++this.duplicateCount % 100 === 0) {
      console.warn(
        `Changed nodes have been the same for ${this.duplicateCount} emits. A feature is likely always updating DOM elements inside an observe without an proper exit condition.`,
        this.changedNodes,
      );
    } else if (!isDuplicate) {
      this.duplicateCount = 0;
    }

    this.lastChangedNodes = this.changedNodes;
  }

  addFeature(feature) {
    if (this.features.indexOf(feature) === -1) {
      this.features.push(feature);
    }
  }

  removeFeature(feature) {
    this.features.splice(this.features.indexOf(feature), 1);
  }

  emitChanges() {
    this.features.forEach((feature) => {
      const observe = feature.observe.bind(feature, this.changedNodes);
      const wrapped = withToolkitError(observe, feature);

      if (ynabToolKit.environment === 'development') {
        this.detectObserveLoop(feature);
      }

      const startFeatureObserve = Date.now();

      wrapped();

      const featureElapsed = Date.now() - startFeatureObserve;
      if (window.ynabToolKit.enableProfiling && featureElapsed > 0) {
        console.log(
          `${feature.constructor.name}.observe() took %c${featureElapsed}ms%c to run`,
          featureElapsed < 10
            ? 'color: green'
            : featureElapsed < 50
            ? 'color: yellow'
            : 'color: red',
          '',
        );
      }
    });
  }

  /**
   * Dev-only: warns if a single feature's observe() is firing many times in a very short
   * window, which usually means its DOM mutation satisfies its own trigger condition again
   * (e.g. adding a class without checking it's not already there) and it's stuck re-running
   * itself with nothing forcing a yield in between.
   */
  detectObserveLoop(feature) {
    const name = feature.constructor.name;
    const now = Date.now();
    const recentCalls = (this.featureInvocationTimestamps.get(name) || []).filter(
      (timestamp) => now - timestamp < OBSERVE_LOOP_WINDOW_MS,
    );
    recentCalls.push(now);
    this.featureInvocationTimestamps.set(name, recentCalls);

    if (recentCalls.length > OBSERVE_LOOP_THRESHOLD) {
      console.error(
        `Possible infinite observe() loop in %c${name}%c: it ran ${recentCalls.length} times in the last ${OBSERVE_LOOP_WINDOW_MS}ms.\n` +
          'This usually means observe()/invoke() mutates the DOM in a way that re-satisfies its own trigger condition on every pass ' +
          '(e.g. adding a class without checking classList.contains() first). Add a guard so the mutation is a no-op once already applied.',
        'font-weight: bold; color: red',
        '',
      );
      // Reset so we don't spam the console on every subsequent call while the loop continues.
      this.featureInvocationTimestamps.set(name, []);
    }
  }
}
