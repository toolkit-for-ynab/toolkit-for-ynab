import { withToolkitError } from 'toolkit/core/common/errors/with-toolkit-error';

let instance = null;

export class ObserveListener {
  constructor() {
    if (instance) {
      return instance;
    }

    this.features = [];

    let _MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let observer = new _MutationObserver(mutations => {
      this.changedNodes = new Set();

      const addChangedNodes = nodes => {
        nodes.each((index, element) => {
          var nodeClass = $(element).attr('class');
          if (nodeClass) {
            this.changedNodes.add(nodeClass.replace(/ember-view/g, '').trim());
          }
        });
      };

      mutations.forEach(mutation => {
        let newNodes = mutation.target;
        let addedNodes = mutation.addedNodes;
        let $nodes = $(newNodes);

        addChangedNodes($nodes);

        if (addedNodes) {
          let $addedNodes = $(addedNodes);
          addChangedNodes($addedNodes);
        }
      });

      // Now we are ready to feed the change digest to the
      // automatically setup feedChanges file/function
      if (this.changedNodes.size > 0) {
        this.emitChanges();
      }
    });

    // This finally says 'Watch for changes' and only needs to be called the one time
    observer.observe($('.ember-view.layout')[0], {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    instance = this;
  }

  addFeature(feature) {
    if (this.features.indexOf(feature) === -1) {
      this.features.push(feature);
    }
  }

  emitChanges() {
    this.features.forEach(feature => {
      const observe = feature.observe.bind(feature, this.changedNodes);
      const wrapped = withToolkitError(observe, feature);
      Ember.run.later(() => {
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
