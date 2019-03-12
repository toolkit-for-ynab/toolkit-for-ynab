import { AutoDistributeSplits } from './index';

describe('AutoDistributeSplits', () => {
  let extension;

  beforeEach(() => {
    extension = new AutoDistributeSplits();
  });

  it('should distribute remaining value proportionally across all subvalues', () => {
    const total = 6.06;
    const remaining = 0.06;
    const originalSubValues = [1.0, 2.0, 3.0];
    const expectedSubValues = [1.01, 2.02, 3.03];
    testDistributionLogic(total, remaining, originalSubValues, expectedSubValues);
  });

  it('should distribute 1 cent correctly when one subvalue is greater than half of subtotal', () => {
    const total = 0.11;
    const remaining = 0.01;
    const originalSubValues = [0.06, 0.04];
    const expectedSubValues = [0.07, 0.04];
    testDistributionLogic(total, remaining, originalSubValues, expectedSubValues);
  });

  it('should distribute 1 cent correctly when both subvalues are half of subtotal', () => {
    const total = 0.11;
    const remaining = 0.01;
    const originalSubValues = [0.05, 0.05];
    const expectedSubValues = [0.06, 0.05];
    testDistributionLogic(total, remaining, originalSubValues, expectedSubValues);
  });

  it('should distribute 1 cent correctly when all subvalues are less than half of subtotal', () => {
    const total = 0.1;
    const remaining = 0.01;
    const originalSubValues = [0.03, 0.03, 0.03];
    const expectedSubValues = [0.03, 0.03, 0.04];
    testDistributionLogic(total, remaining, originalSubValues, expectedSubValues);
  });

  function testDistributionLogic(total, remaining, subValues, expectedSubValues) {
    const newSubValues = extension.getUpdatedSubValues(subValues, total, remaining);

    const newTotal = newSubValues.reduce((a, b) => a + b);
    expect(newTotal).toBeCloseTo(total, 2);

    expect(newSubValues).toEqual(expectedSubValues);
  }
});
