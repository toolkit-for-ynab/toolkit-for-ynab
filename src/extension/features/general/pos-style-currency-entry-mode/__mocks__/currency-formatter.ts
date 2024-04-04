import { YnabGlobalHasWebinstance } from '../pos-style-parser.test';

const currencyTemplate = {
  decimal_digits: 2,
  decimal_separator: ',',
  example_format: '123.456,78',
};

function countSplits(string: string, splitChar: string) {
  return string.split(splitChar).length;
}

type RoundingFunction = (x: number) => number;

export class CurrencyFormatter {
  fixed_precision_amount: number;
  _currencyObj: YNABCurrencyInformation;
  convertFromMilliUnits: (e: number) => number;
  convertToMilliUnits: (e: number, t?: RoundingFunction) => number;
  roundMilliUnits: (e: number, t?: RoundingFunction) => number;
  getFormatDefinition: () => YNABCurrencyInformation;

  constructor() {
    this.fixed_precision_amount = 1e3;
    this._currencyObj = { ...currencyTemplate };
    this.convertFromMilliUnits = this.convertFromMilliDollars;
    this.convertToMilliUnits = this.convertToMilliDollars;
    this.roundMilliUnits = this.roundMilliDollars;
    this.getFormatDefinition = this.getCurrency;
  }

  getCurrency(): YNABCurrencyInformation {
    return this._currencyObj;
  }

  convertFromMilliDollars(e: number) {
    e = +e;
    const t = this._currencyObj.decimal_digits;
    return +(e / this.fixed_precision_amount).toFixed(t);
  }

  convertToMilliDollars(e: number, t = Math.round): number {
    const n = +t(e * this.fixed_precision_amount);
    return this.roundMilliDollars(n, t);
  }

  roundMilliDollars(e: number, t = Math.round): number {
    let n = this.getMinimumAmount();
    n = 1 / n;
    return t(e * n) / n;
  }

  getMinimumAmount(): number {
    return 10 ** (3 - Math.min(3, this._currencyObj.decimal_digits));
  }

  roundToCorrectNumberOfDigits(e: number): number {
    e = +e;
    const t = this._currencyObj.decimal_digits;
    return +e.toFixed(t);
  }

  format(e: number) {
    if (Number.isNaN(e)) e = 0;
    let n = this.convertFromMilliDollars(e).toFixed(this._currencyObj.decimal_digits);
    if (this._currencyObj.optional_decimals) n = parseFloat(n).toString();

    const o = n.split('.');
    const a =
      this._currencyObj.example_format === '1,23,456.78'
        ? /(\d)(?=(\d\d)+\d$)/g
        : /(\d)(?=(\d\d\d)+(?!\d))/g;
    o[0] = o[0].replace(a, `$1${this._currencyObj.group_separator}`);
    let r = o.join(this._currencyObj.decimal_separator);
    return r;
  }

  countChar(e: string, t: string): number {
    return e.split(t).length;
  }

  unformat(e: null | undefined | number | string): number {
    if (e == null) return 0;
    let t = 0;
    if (undefined === e) t = 0;
    else if (typeof e === 'number') t = e;
    else if (typeof e === 'string') {
      e = e.replace(/−/g, '-');
      if (
        this._currencyObj.decimal_separator !== '.' &&
        this._currencyObj.decimal_separator === '-' &&
        e.match(/^-/)
      ) {
        e = `(${e.substring(1)})`;
      }
      e = e.replace(/\./g, '').replace(this._currencyObj.decimal_separator, '.');

      const n = (function (x) {
        const splitSum =
          countSplits(x, '-') + Math.min(countSplits(x, '(') - 1, countSplits(x, ')') - 1);
        return splitSum % 2 ? 1 : -1;
      })(e);
      const o = Number(e.replace(/[^0-9.]+/g, '')) * n;
      t = Number.isNaN(o) ? 0 : o;
    } else t = 0;
    return this.roundToCorrectNumberOfDigits(t);
  }
}

export const createYnabGlobalStructureMock: () => YnabGlobalHasWebinstance = () => {
  return {
    YNABSharedLibWebInstance: {
      firstInstanceCreated: {
        formattingManager: {
          currencyFormatter: new CurrencyFormatter(),
        },
      },
    },
  };
};
