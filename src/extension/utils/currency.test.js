import { stripCurrency } from './currency';

describe('stripCurrency', () => {
  const currencyFormatter = {
    unformat: jest.fn(),
    convertToMilliDollars: jest.fn(),
  };
  beforeEach(() => defineYnabSharedLib(currencyFormatter));
  afterEach(() => delete global.ynab);

  it('should handle fractional values correctly', () => {
    currencyFormatter.unformat.mockReturnValue(0.5);
    currencyFormatter.convertToMilliDollars.mockReturnValue(500);
    expect(stripCurrency('0.50')).toBe(500);
  });

  it('should handle integer values correctly', () => {
    currencyFormatter.unformat.mockReturnValue(1);
    currencyFormatter.convertToMilliDollars.mockReturnValue(1000);
    expect(stripCurrency('1.00')).toBe(1000);
  });
});

function defineYnabSharedLib(currencyFormatter) {
  global.ynab = {
    YNABSharedLibWebInstance: {
      firstInstanceCreated: {
        formattingManager: {
          currencyFormatter,
        },
      },
    },
  };
}
