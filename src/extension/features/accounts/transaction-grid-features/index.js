import { Feature } from 'toolkit/extension/features/feature';
import { TransactionGridFeature } from './feature';
import { RunningBalance } from './running-balance';
import { CheckNumbers } from './check-numbers';
import { SwapClearedFlagged } from './swap-cleared-flagged';
import { ReconciledTextColor } from './reconciled-text-color';
import { controllerLookup, componentLookup } from 'toolkit/extension/utils/ember';

export class TransactionGridFeatures extends Feature {
  features = [
    ynabToolKit.options.CheckNumbers ? new CheckNumbers() : new TransactionGridFeature(),
    ynabToolKit.options.RunningBalance !== '0'
      ? new RunningBalance()
      : new TransactionGridFeature(),
    ynabToolKit.options.ReconciledTextColor !== '0'
      ? new ReconciledTextColor()
      : new TransactionGridFeature(),
    ynabToolKit.options.SwapClearedFlagged
      ? new SwapClearedFlagged()
      : new TransactionGridFeature(),
  ];

  injectCSS() {
    const css = this.features.reduce((allCSS, feature) => {
      allCSS += feature.injectCSS();
      return allCSS;
    }, '');

    return css;
  }

  willInvoke() {
    // any of the components added here must be loaded when YNAB loads. if they
    // are not available in the cache, this feature will crash. move them to
    // invoke function if that is the case.
    this.attachWillInsertHandler('register/grid-sub');
    this.attachWillInsertHandler('register/grid-row');
    this.attachWillInsertHandler('register/grid-scheduled');
    this.attachWillInsertHandler('register/grid-scheduled-sub');
    this.attachWillInsertHandler('register/grid-actions');
    this.attachWillInsertHandler('register/grid-split');

    let accountsController = controllerLookup('accounts');
    accountsController.notifyPropertyChange('contentResults');

    return Promise.all(this.features.map(feature => feature.willInvoke()));
  }

  // we always want to invoke this feature if it's enabled because we want
  // to at least initialize running balance on all of the accounts
  shouldInvoke() {
    return this.features.some(feature => feature.shouldInvoke());
  }

  attachWillInsertHandler(componentName) {
    const _this = this;
    const GridComponent = componentLookup(componentName);

    if (GridComponent.__toolkitInitialized) {
      return;
    }

    try {
      GridComponent.constructor.reopen({
        didUpdate: function() {
          _this.features.forEach(feature => {
            if (feature.shouldInvoke()) {
              feature.didUpdate.call(this);
            }
          });
        },
        willInsertElement: function() {
          _this.features.forEach(feature => {
            if (feature.shouldInvoke()) {
              feature.willInsertColumn.call(this);
            }
          });
        },
      });
    } catch (e) {
      GridComponent.reopen({
        didUpdate: function() {
          _this.features.forEach(feature => {
            if (feature.shouldInvoke()) {
              feature.didUpdate.call(this);
            }
          });
        },
        willInsertElement: function() {
          _this.features.forEach(feature => {
            if (feature.shouldInvoke()) {
              feature.willInsertColumn.call(this);
            }
          });
        },
      });
    }

    // this is really hacky but I'm not sure what else to do, most of these components
    // double render so the `willInsertElement` works for those but the add rows
    // and footer are weird. add-rows doesn't double render and will work every time
    // after the component has been cached but footer is _always_ a new component WutFace
    let $appendToRows;
    switch (componentName) {
      case 'register/grid-add':
        $appendToRows = $('.ynab-grid-add-rows .ynab-grid-body-row.is-editing');
        break;
      case 'register/grid-sub-edit':
        $appendToRows = $('.ynab-grid-body-sub.is-editing');
        break;
      case 'register/grid-footer':
        $appendToRows = $('.ynab-grid-body-row.ynab-grid-footer');
        break;
    }

    if ($appendToRows) {
      this.features.forEach(feature => {
        if (feature.shouldInvoke()) {
          feature.handleSingleRenderColumn($appendToRows, componentName);
        }
      });
    }

    GridComponent.__toolkitInitialized = true;
  }

  invoke() {
    this.features.forEach(feature => {
      if (feature.shouldInvoke()) {
        feature.insertHeader();
        feature.invoke();
      }
    });
  }

  // We're not querying the DOM here because we really want this observe to be as
  // cheap as possible. The four components we look for are not guaranteed to have ever
  // be created which means they won't be in the registry when we try to attach our listener
  // to them. Once one of them has been created, we'll attach a listener and `__toolkitInitialized`
  // should save us from any more processing. Once all four of them have been loaded, this
  // will continue to be a near noop observe.
  observe() {
    if (!this.shouldInvoke()) {
      return;
    }

    const gridEditComponent = componentLookup('register/grid-edit');
    const gridAddComponent = componentLookup('register/grid-add');
    const gridSubEditComponent = componentLookup('register/grid-sub-edit');
    const gridGridFooterComponent = componentLookup('register/grid-footer');

    if (gridEditComponent && !gridEditComponent.__toolkitInitialized) {
      this.attachWillInsertHandler('register/grid-edit');
    }

    if (gridAddComponent && !gridAddComponent.__toolkitInitialized) {
      this.attachWillInsertHandler('register/grid-add');
    }

    if (gridSubEditComponent && !gridSubEditComponent.__toolkitInitialized) {
      this.attachWillInsertHandler('register/grid-sub-edit');
    }

    if (gridGridFooterComponent && !gridGridFooterComponent.__toolkitInitialized) {
      this.attachWillInsertHandler('register/grid-footer');
    }
  }

  onRouteChanged(route) {
    if (route.includes('account')) {
      let shouldAnyInvoke = false;
      this.features.forEach(feature => {
        if (!feature.shouldInvoke()) {
          feature.cleanup();
        } else {
          shouldAnyInvoke = true;
        }
      });

      if (shouldAnyInvoke) {
        this.invoke();
      }
    }
  }

  onBudgetChanged() {
    this.features.forEach(feature => feature.onBudgetChanged());
  }
}
