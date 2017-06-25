let instance = null;

export class ObserveListener {
  constructor() {
    if (instance) {
      return instance;
    }

    this.features = [];

    let _MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let observer = new _MutationObserver((mutations) => {
      this.changedNodes = new Set();

      mutations.forEach((mutation) => {
        let newNodes = mutation.target;
        let $nodes = $(newNodes);

        $nodes.each((index, element) => {
          var nodeClass = $(element).attr('class');
          if (nodeClass) {
            this.changedNodes.add(nodeClass.replace(/^ember-view /, ''));
          }
        });
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
      attributeFilter: ['class']
    });

    return instance;
  }

  addFeature(feature) {
    if (this.features.indexOf(feature) === -1) {
      this.features.push(feature);
    }
  }

  emitChanges() {
    this.features.forEach((feature) => {
      Ember.run.later(feature.observe.bind(feature, this.changedNodes), 0);
    });
  }
}
