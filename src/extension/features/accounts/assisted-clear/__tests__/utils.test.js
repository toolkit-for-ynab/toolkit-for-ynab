describe('Assisted Clear Utils', () => {
  describe('findMatchingSum()', () => {
    let utils;
    beforeAll(() => {
      utils = require('../assistedClearUtils');
    });
    it('should find a single match with single transaction', () => {
      let transactions = [{ amount: 5 }];
      let powerset = utils.generatePowerset(transactions);
      let results = utils.findMatchingSum(powerset, 5);
      expect(results.length).toBe(1);
      let expected = [[{ amount: 5 }]];
      expect(results).toEqual(expect.arrayContaining(expected));
    });

    it('should not find a single match with single transaction', () => {
      let transactions = [{ amount: 5 }];
      let powerset = utils.generatePowerset(transactions);
      let results = utils.findMatchingSum(powerset, 344);
      expect(results.length).toBe(0);
    });

    it('should find a single match with two transactions', () => {
      let transactions = [{ amount: 5 }, { amount: 10 }];
      let powerset = utils.generatePowerset(transactions);
      let results = utils.findMatchingSum(powerset, 15);
      expect(results.length).toBe(1);
      let expected = [[{ amount: 5 }, { amount: 10 }]];
      expect(results).toEqual(expect.arrayContaining(expected));
    });

    it('should find no matches', () => {
      let transactions = [{ amount: 5 }, { amount: 10 }];
      let powerset = utils.generatePowerset(transactions);
      let results = utils.findMatchingSum(powerset, 9999);
      expect(results.length).toBe(0);
    });

    it('should find inflow + outflow or empty', () => {
      let transactions = [{ amount: 5 }, { amount: -5 }];
      let powerset = utils.generatePowerset(transactions);
      let results = utils.findMatchingSum(powerset, 0);
      expect(results.length).toBe(2);
      let expected = [[{ amount: 5 }, { amount: -5 }], []];
      expect(results).toEqual(expect.arrayContaining(expected));
    });

    it('should find nothing with empty transaction', () => {
      let transactions = [];
      let powerset = utils.generatePowerset(transactions);
      let results = utils.findMatchingSum(powerset, 0);
      expect(results.length).toBe(1);
      let expected = [];
      expect(results).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('generatePowerset()', () => {
    let utils;
    beforeAll(() => {
      utils = require('../assistedClearUtils');
    });

    it('should return empty set', () => {
      let transactions = [];
      let results = utils.generatePowerset(transactions);
      expect(results.length).toBe(1);
      expect(results[0].length).toBe(0);
    });

    it('should return with single transaction', () => {
      let transactions = [{ amount: 5 }];
      let results = utils.generatePowerset(transactions);
      expect(results.length).toBe(2);
      let expected = [[], [{ amount: 5 }]];
      expect(results).toEqual(expect.arrayContaining(expected));
    });

    it('should return with two transactions', () => {
      let transactions = [{ amount: 5 }, { amount: 10 }];
      let results = utils.generatePowerset(transactions);
      expect(results.length).toBe(4);
      let expected = [[], [{ amount: 5 }], [{ amount: 10 }], [{ amount: 5 }, { amount: 10 }]];
      expect(results).toEqual(expect.arrayContaining(expected));
    });
  });
});
