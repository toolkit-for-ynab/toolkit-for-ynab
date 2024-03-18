jest.mock('toolkit/extension/features/feature');
import { POSStyleCurrencyEntryMode } from '.';
import { createYnabGlobalStructureMock } from './__mocks__/currency-formatter';
import { POSStyleParser } from './pos-style-parser';

export interface YnabGlobalHasWebinstance {
  YNABSharedLibWebInstance: YNABSharedLibWebInstance;
}

declare module globalThis {
  let ynab: YnabGlobalHasWebinstance;
}

function setYnabGlobal(value: YnabGlobalHasWebinstance) {
  Object.defineProperty(globalThis, 'ynab', {
    value: value,
    configurable: true,
    writable: true,
  });
}

describe('POSStyleParser', () => {
  let extension: POSStyleParser;

  const globalYnabBackup = globalThis.ynab;

  beforeEach(() => {
    setYnabGlobal(createYnabGlobalStructureMock());
    const { currencyFormatter } =
      ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;
    extension = new POSStyleParser(currencyFormatter);
  });

  afterAll(() => {
    setYnabGlobal(globalYnabBackup);
  });

  describe('the mock', () => {
    // todo remove when tests are finished
    it('should provide the currency manager using the global ynab structure', () => {
      expect(extension.formatter).toBeDefined();
      expect(extension.formatter.getCurrency).toBeDefined();

      const currency = extension.formatter.getCurrency();
      expect(currency.decimal_separator).toBe(',');
    });

    it('should provide a possibility to configure e.g. decimal digits', () => {
      const currency = extension.formatter.getCurrency();
      expect(currency.decimal_digits).toBe(2);

      extension.formatter._currencyObj!.decimal_digits = 3;
      expect(currency.decimal_digits).toBe(3);
    });

    it('should always start with the same value for decimal digits', () => {
      const currency = extension.formatter.getCurrency();
      expect(currency.decimal_digits).toBe(2);
    });
  });

  describe('determineValue()', () => {
    it('should return decimal values with the right separator as is', () => {
      const inputs = ['0,01', '0,999', '-2,0', '123456789123456789,5'];

      expect(extension.determineValue('-2,0')).toBe('-2,0');

      inputs.forEach((input) => {
        expect(extension.determineValue(input)).toBe(input);
      });
    });

    it('should ignore the wrong separator', () => {
      expect(extension.determineValue('0.01')).toBe('0.01');
      expect(extension.determineValue('12.3.4')).toBe('12.3.4');
    });

    it('should interpret numbers in POS style, e.g. 500 -> 5,00', () => {
      expect(extension.determineValue('1')).toBe('0,01');
      expect(extension.determineValue('99')).toBe('0,99');
      expect(extension.determineValue('100')).toBe('1,00');
      expect(extension.determineValue('1234')).toBe('12,34');
    });

    it('should allow the postfix - to be used for full monetary units', () => {
      expect(extension.determineValue('1-')).toBe('1');
      expect(extension.determineValue('1234-')).toBe('1234');
    });

    it('should not change numbers with decimal separator and postfix', () => {
      expect(extension.determineValue('1,0-')).toBe('1,0-');
      expect(extension.determineValue('1,1-')).toBe('1,1-');
    });

    it('should support math operations', () => {
      expect(extension.determineValue('50*5')).toBe('2,50');
      expect(extension.determineValue('11*9')).toBe('0,99');
      expect(extension.determineValue('11*10')).toBe('1,10');
      expect(extension.determineValue('5/3*100')).toBe('1,67');
      expect(extension.determineValue('5%3*100')).toBe('2,00');
    });

    it('should round to a different number of digits, if specified', () => {
      extension.formatter._currencyObj!.decimal_digits = 3;

      expect(extension.determineValue('1')).toBe('0,001');
      expect(extension.determineValue('999')).toBe('0,999');
      expect(extension.determineValue('1000')).toBe('1,000');
      expect(extension.determineValue('5/3*100')).toBe('0,167');
    });
  });
});
