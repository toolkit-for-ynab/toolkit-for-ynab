jest.mock('toolkit/extension/features/feature');

import * as ynabUtils from 'toolkit/extension/utils/ynab';
import { ShowCategoryBalance } from './index';

describe('ShowCategoryBalance', () => {
  let feature;

  beforeEach(() => {
    document.body.innerHTML = '';
    feature = new ShowCategoryBalance();
  });

  function addGridRow(rowId) {
    const row = document.createElement('div');
    row.className = 'ynab-grid-body-row';
    row.dataset.rowId = rowId;
    document.body.appendChild(row);
    return row;
  }

  describe('shouldInvoke()', () => {
    it('is false when not on the accounts route, even if grid rows are present', () => {
      jest.spyOn(ynabUtils, 'isCurrentRouteAccountsPage').mockReturnValue(false);
      addGridRow('txn-1');

      expect(feature.shouldInvoke()).toBe(false);
    });

    it('is true on the accounts route when grid rows are present', () => {
      jest.spyOn(ynabUtils, 'isCurrentRouteAccountsPage').mockReturnValue(true);
      addGridRow('txn-1');

      expect(feature.shouldInvoke()).toBe(true);
    });
  });

  describe('invoke()', () => {
    it('does not throw when visibleTransactionDisplayItems is undefined', () => {
      addGridRow('txn-1');
      jest.spyOn(ynabUtils, 'getRegisterGridService').mockReturnValue({});

      expect(() => feature.invoke()).not.toThrow();
    });

    it('does not throw when the register grid service itself is undefined', () => {
      addGridRow('txn-1');
      jest.spyOn(ynabUtils, 'getRegisterGridService').mockReturnValue(undefined);

      expect(() => feature.invoke()).not.toThrow();
    });
  });

  describe('observe()', () => {
    it('does not invoke when shouldInvoke() is false', () => {
      jest.spyOn(feature, 'shouldInvoke').mockReturnValue(false);
      const invokeSpy = jest.spyOn(feature, 'invoke');

      feature.observe(new Set(['ynab-grid-body-row']));

      expect(invokeSpy).not.toHaveBeenCalled();
    });

    it('invokes when shouldInvoke() is true and a relevant node changed', () => {
      jest.spyOn(feature, 'shouldInvoke').mockReturnValue(true);
      const invokeSpy = jest.spyOn(feature, 'invoke').mockImplementation(() => {});

      feature.observe(new Set(['ynab-grid-body-row']));

      expect(invokeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
