import { withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';
import { ynabRequire } from '../utils/ynab';

const { later } = ynabRequire('@ember/runloop');

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
  // when you scroll on an accounts page :D
  'ynab-grid-container scrolling',
  'ynab-grid-container',
  'scrolling',
]);

export class ObserveListener {
  lastChangedNodes = new Set();

  duplicateCount = 0;

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
      this.lastChangedNodes.has(element)
    );
    if (isDuplicate && ++this.duplicateCount % 100 === 0) {
      console.warn(
        `Changed nodes have been the same for ${this.duplicateCount} emits. A feature is likely always updating DOM elements inside an observe without an proper exit condition.`,
        this.changedNodes
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
    this.features.removeAt(this.features.indexOf(feature));
  }

  emitChanges() {
    this.features.forEach((feature) => {
      const observe = feature.observe.bind(feature, this.changedNodes);
      const wrapped = withToolkitError(observe, feature);
      later(() => {
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
            ''
          );
        }
      }, 0);
    });
  }
}
