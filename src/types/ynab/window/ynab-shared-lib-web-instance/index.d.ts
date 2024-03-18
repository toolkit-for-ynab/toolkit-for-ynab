interface YNABSharedLibWebInstance {
  firstInstanceCreated: YNABSharedLibFirstInstanceCreated;
}

interface YNABSharedLibFirstInstanceCreated {
  formattingManager: YNABFormattingManager;
}

interface YNABFormattingManager {
  currencyFormatter: YNABCurrencyFormatter;
}

interface YNABCurrencyFormatter {
  _currencyObj?: YNABCurrencyInformation;
  fixed_precision_amount: number;
  unformat(value: number | string | undefined): number;
  format(capped: number): string;
  convertToMilliUnits(unformatted: number): number;
  getCurrency(): YNABCurrencyInformation;
}

interface YNABCurrencyInformation {
  example_format: string;
  group_separator?: string;
  decimal_separator: string;
  decimal_digits: number;
  optional_decimals?: number;
}
