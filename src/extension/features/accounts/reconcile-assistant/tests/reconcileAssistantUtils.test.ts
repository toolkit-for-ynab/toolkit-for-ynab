describe('Reconcile Assistant Utils', () => {
  describe('findMatchingSum()', () => {
    let utils: any;
    beforeAll(() => {
      utils = require('../reconcileAssistantUtils');
    });
    it('should find a single match with single transaction', () => {
      let transactions: Array<Transaction> = [{ amount: 5 }];
      let powerset: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      let results: Array<Array<Transaction>> = utils.findMatchingSum(powerset, 5);
      expect(results.length).toBe(1);
      let expected: Array<Array<Transaction>> = [[{ amount: 5 }]];
      expect(results).toEqual(expect.arrayContaining(expected));
    });

    it('should not find a single match with single transaction', () => {
      let transactions: Array<Transaction> = [{ amount: 5 }];
      let powerset: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      let results: Array<Array<Transaction>> = utils.findMatchingSum(powerset, 344);
      expect(results.length).toBe(0);
    });

    it('should find a single match with two transactions', () => {
      let transactions: Array<Transaction> = [{ amount: 5 }, { amount: 10 }];
      let powerset: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      let results: Array<Array<Transaction>> = utils.findMatchingSum(powerset, 15);
      expect(results.length).toBe(1);
      let expected: Array<Array<Transaction>> = [[{ amount: 5 }, { amount: 10 }]];
      expect(results).toEqual(expect.arrayContaining(expected));
    });

    it('should find no matches', () => {
      let transactions: Array<Transaction> = [{ amount: 5 }, { amount: 10 }];
      let powerset: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      let results: Array<Array<Transaction>> = utils.findMatchingSum(powerset, 9999);
      expect(results.length).toBe(0);
    });

    it('should find inflow + outflow or empty', () => {
      let transactions: Array<Transaction> = [{ amount: 5 }, { amount: -5 }];
      let powerset: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      let results: Array<Array<Transaction>> = utils.findMatchingSum(powerset, 0);
      expect(results.length).toBe(2);
      let expected: Array<Array<Transaction>> = [[{ amount: 5 }, { amount: -5 }], []];
      expect(results).toEqual(expect.arrayContaining(expected));
    });

    it('should find nothing with empty transaction', () => {
      let transactions: Array<Transaction> = [];
      let powerset: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      let results: Array<Array<Transaction>> = utils.findMatchingSum(powerset, 0);
      expect(results.length).toBe(1);
      let expected: Array<Transaction> = [];
      expect(results).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('getUnclearedTransactions(transactions)', () => {
    let utils: any;
    beforeAll(() => {
      utils = require('../reconcileAssistantUtils');
    });

    it('should return nothing if no transactions', () => {
      let transactions: Array<Transaction> = [];
      let results: Array<Transaction> = utils.getUnclearedTransactions(transactions);
      expect(results.length).toBe(0);
    });

    it('should return only cleared transactions', () => {
      let t1: Transaction = mockTransaction(5, 'Cleared', false);
      let t2: Transaction = mockTransaction(10, 'Uncleared', false);
      let transactions: Array<Transaction> = [t1, t2];

      let result: Array<Transaction> = utils.getUnclearedTransactions(transactions);
      expect(result.length).toBe(1);
      expect(result[0]).toBe(t2);
    });

    it('should return nothing when there are no cleared transactions', () => {
      let t1: Transaction = mockTransaction(5, 'Cleared', false);
      let t2: Transaction = mockTransaction(10, 'Cleared', false);
      let transactions: Array<Transaction> = [t1, t2];

      let result: Array<Transaction> = utils.getUnclearedTransactions(transactions);
      expect(result.length).toBe(0);
    });

    it('should ignore deleted transactions', () => {
      let t1: Transaction = mockTransaction(5, 'Uncleared', false);
      let t2: Transaction = mockTransaction(10, 'Uncleared', true);
      let t3: Transaction = mockTransaction(10, 'Uncleared', false);
      let transactions: Array<Transaction> = [t1, t2, t3];
      let result: Array<Transaction> = utils.getUnclearedTransactions(transactions);
      expect(result.length).toBe(2);
    });
  });

  /**
   * Helper function to mock a transaction
   * @param {number} amount The amount of the transaction
   * @param {string} cleared The cleared value
   */
  function mockTransaction(amount: number, cleared: string, isTombstone: boolean) {
    return {
      amount: amount,
      cleared: cleared,
      isUncleared: () => {
        return cleared === 'Uncleared';
      },
      isTombstone: isTombstone,
    };
  }

  describe('generatePowerset()', () => {
    let utils: any;
    beforeAll(() => {
      utils = require('../reconcileAssistantUtils');
    });

    it('should return empty set', () => {
      let transactions: Array<Transaction> = [];
      let results: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      expect(results.length).toBe(1);
      expect(results[0].length).toBe(0);
    });

    it('should return with single transaction', () => {
      let transactions: Array<Transaction> = [{ amount: 5 }];
      let results: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      expect(results.length).toBe(2);
      let expected: Array<Array<Transaction>> = [[], [{ amount: 5 }]];
      expect(results).toEqual(expect.arrayContaining(expected));
    });

    it('should return with two transactions', () => {
      let transactions: Array<Transaction> = [{ amount: 5 }, { amount: 10 }];
      let results: Array<Array<Transaction>> = utils.generatePowerset(transactions);
      expect(results.length).toBe(4);
      let expected: Array<Array<Transaction>> = [
        [],
        [{ amount: 5 }],
        [{ amount: 10 }],
        [{ amount: 5 }, { amount: 10 }],
      ];
      expect(results).toEqual(expect.arrayContaining(expected));
    });
  });
});
