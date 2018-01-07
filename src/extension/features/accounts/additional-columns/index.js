import { Feature } from 'toolkit/extension/features/feature';
import { AdditionalColumnStub } from './additional-column-stub';
import { RunningBalance } from './running-balance';
import { CheckNumbers } from './check-numbers';
import * as toolkitHelper from 'toolkit/extension/helpers/toolkit';

export class AdditionalColumns extends Feature {
  constructor() {
    super();
    this.checkNumbers = ynabToolKit.options.CheckNumbers ? new CheckNumbers() : new AdditionalColumnStub();
    this.runningBalance = ynabToolKit.options.RunningBalance !== '0' ? new RunningBalance() : new AdditionalColumnStub();
  }

  injectCSS() {
    let css = require('./index.css');

    if (ynabToolKit.options.RunningBalance === '1') {
      css += require('./highlight-negatives.css');
    }

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

    let accountsController = toolkitHelper.controllerLookup('accounts');
    accountsController.notifyPropertyChange('contentResults');

    return Promise.all([
      this.checkNumbers.willInvoke(),
      this.runningBalance.willInvoke()
    ]);
  }

  // we always want to invoke this feature if it's enabled because we want
  // to at least initialize running balance on all of the accounts
  shouldInvoke() {
    return this.runningBalance.shouldInvoke() ||
           this.checkNumbers.shouldInvoke();
  }

  attachWillInsertHandler(componentName) {
    const _this = this;
    const GridComponent = toolkitHelper.componentLookup(componentName);

    if (GridComponent.__toolkitInitialized) { return; }

    try {
      GridComponent.constructor.reopen({
        willInsertElement: function () {
          if (_this.checkNumbers.shouldInvoke()) {
            _this.checkNumbers.willInsertColumn.call(this);
          }

          if (_this.runningBalance.shouldInvoke()) {
            _this.runningBalance.willInsertColumn.call(this);
          }
        }
      });
    } catch (e) {
      GridComponent.reopen({
        willInsertElement: function () {
          if (_this.checkNumbers.shouldInvoke()) {
            _this.checkNumbers.willInsertColumn.call(this);
          }

          if (_this.runningBalance.shouldInvoke()) {
            _this.runningBalance.willInsertColumn.call(this);
          }
        }
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
      this.checkNumbers.handleSingleRenderColumn($appendToRows, componentName);
      this.runningBalance.handleSingleRenderColumn($appendToRows, componentName);
    }

    GridComponent.__toolkitInitialized = true;
  }

  invoke() {
    if (this.checkNumbers.shouldInvoke()) {
      this.checkNumbers.insertHeader();
    }

    if (this.runningBalance.shouldInvoke()) {
      this.runningBalance.insertHeader();
    }

    if ($('.ynab-grid-body-row.is-editing', '.ynab-grid-body').length) {
      this.attachWillInsertHandler('register/grid-edit');
    }

    if ($('.ynab-grid-add-rows', '.ynab-grid').length) {
      this.attachWillInsertHandler('register/grid-add');
    }

    if ($('.ynab-grid-body-split.is-editing', '.ynab-grid').length) {
      this.attachWillInsertHandler('register/grid-sub-edit');
    }

    if ($('.ynab-grid-body-row.ynab-grid-footer', '.ynab-grid').length) {
      this.attachWillInsertHandler('register/grid-footer');
    }

    ynabToolKit.invokeFeature('AdjustableColumnWidths');
  }

  observe(changedNodes) {
    if (!this.runningBalance.shouldInvoke()) {
      this.runningBalance.cleanup();
    }

    if (!this.checkNumbers.shouldInvoke()) {
      this.checkNumbers.cleanup();
    }

    if (!this.runningBalance.shouldInvoke() && !this.checkNumbers.shouldInvoke()) {
      return;
    }

    if (
      changedNodes.has('ynab-grid-body') ||
      changedNodes.has('ynab-grid')
    ) {
      this.invoke();
    }
  }
}
