import { AssistedClear } from './index';
describe('Assisted Clear', () => {
  it('should invoke correctly', () => {
    let extension = new AssistedClear();
    expect(extension).toBeTruthy();
    expect(extension).toBeInstanceOf(AssistedClear);
  });

  describe('_attachInputListener()', () => {
    let feature;
    beforeEach(() => {
      feature = new AssistedClear();
    });

    it('should do nothing if not found', () => {
      document.body.innerHTML =
        "<div class='modal-account-reconcile-enter-balance'>Has No Inputs<div>";
      let element = $('.modal-account-reconcile-enter-balance');
      expect(feature._reconcileInputValue).toBe(0);
      feature._attachInputListener();
      expect(element.length).toBe(1);
      expect(element.find('input').length).toBe(0);
      expect(feature._reconcileInputValue).toBe(0);
    });
  });

  describe('observe()', () => {
    let feature;
    beforeEach(() => {
      feature = new AssistedClear();
    });
    it('should attach an input listener', () => {
      let attachInputListenerMock = jest.spyOn(feature, '_attachInputListener');
      let invokeMock = jest.spyOn(feature, 'invoke');

      // Attach an input listener scenario
      let changedNodes = new Set();
      changedNodes.add('modal-account-reconcile-enter-balance');
      feature.observe(changedNodes);
      expect(attachInputListenerMock.mock.calls.length).toBe(1);
      expect(invokeMock.mock.calls.length).toBe(0);

      // Invoked scenario
      changedNodes.clear();
      changedNodes.add('accounts-adjustment-label user-data');
      feature.observe(changedNodes);
      expect(invokeMock.mock.calls.length).toBe(1);
      expect(attachInputListenerMock.mock.calls.length).toBe(1);

      // Nothing valid scenario
      changedNodes.clear();
      feature.observe(changedNodes);
      expect(invokeMock.mock.calls.length).toBe(1);
      expect(attachInputListenerMock.mock.calls.length).toBe(1);
    });
  });

  describe('shouldInvoke()', () => {
    let feature;
    let ynabUtils;
    beforeEach(() => {
      ynabUtils = require('toolkit/extension/utils/ynab');
      feature = new AssistedClear();
    });

    it('should return invoke on accounts page', () => {
      let isCurrentRouteAccountsPageMock = jest
        .spyOn(ynabUtils, 'isCurrentRouteAccountsPage')
        .mockImplementation(() => {
          return true;
        });
      document.body.innerHTML = "<div class='accounts-header-reconcile'></div>";
      expect(feature.shouldInvoke()).toBeTruthy();
      expect(isCurrentRouteAccountsPageMock.mock.calls.length).toBe(1);
    });

    it('should return false if not on accounts page', () => {
      let isCurrentRouteAccountsPageMock = jest
        .spyOn(ynabUtils, 'isCurrentRouteAccountsPage')
        .mockImplementation(() => {
          return false;
        });
      document.body.innerHTML = "<div class='accounts-header-reconcile'></div>";
      expect(feature.shouldInvoke()).toBeFalsy();
      expect(isCurrentRouteAccountsPageMock.mock.calls.length).toBe(1);
    });

    it('should return false if element not present', () => {
      let isCurrentRouteAccountsPageMock = jest
        .spyOn(ynabUtils, 'isCurrentRouteAccountsPage')
        .mockImplementation(() => {
          return true;
        });
      document.body.innerHTML = "<div class='not-there-anymore'></div>";
      expect(feature.shouldInvoke()).toBeFalsy();
      expect(isCurrentRouteAccountsPageMock.mock.calls.length).toBe(0);
    });
  });
});
