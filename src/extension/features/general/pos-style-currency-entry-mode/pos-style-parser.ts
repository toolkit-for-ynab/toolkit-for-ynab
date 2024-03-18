import { ToolkitMath } from 'toolkit/extension/utils/math';

/* Parser for POS-style entry in YNAB. */
export class POSStyleParser {
  readonly formatter: YNABCurrencyFormatter;
  private currency: null | YNABCurrencyInformation = null;
  private toolkitMathInstance: null | ToolkitMath = null;
  private maxValueMillis: number = 1e15;

  constructor(currencyFormatter: YNABCurrencyFormatter) {
    this.formatter = currencyFormatter;
  }

  /** This method checks whether the input string consists of only digits and an
   * optional sign (positive or negative). */
  isOnlyDigitsAndSign(input: string): boolean {
    return /^-?\d+$/.test(input);
  }

  /**
   * The function isDigitsWithPostfix checks if a string consists of digits with a hyphen at the
   * beginning.
   */
  isDigitsWithPostfix(input: string): boolean {
    return /^-?\d+-$/.test(input);
  }

  /**
   * The function checks if a given input string is a mathematical expression without any decimal
   * numbers.
   */
  isMathExpressionNoDecimals(input: string): boolean {
    const separatorRegex = new RegExp(`${this.#loadCurrency().decimal_separator}`);
    return /[-*+/^%]/.test(input) && !input.endsWith('-') && !separatorRegex.test(input);
  }

  /**
   * The function `determineValue` takes a string input and processes it based on the different cases
   * that are expected in the entry of numbers. Those include POS-entry, classical entry with decimal
   * points and mathematical expressions.
   */
  determineValue(input: string): string | number {
    this.#loadCurrency();

    const posMultiplier =
      this.formatter.fixed_precision_amount / 10 ** this.#loadCurrency().decimal_digits;

    let result;

    // Case 1 - Digits and sign only -> POS style entry, e.g. 5 -> 0.05
    if (this.isOnlyDigitsAndSign(input)) {
      const intValue = parseInt(input) * posMultiplier;
      result = this.#normalizeEditValue(intValue);
    }

    // Case 2 - Digits with "-" suffix, shorthand for full denomination entry (e.g. "5-" == "5.00")
    else if (this.isDigitsWithPostfix(input)) {
      result = input.substring(0, input.length - 1);
    }

    // Case 3 - Digits with math operators, but no decimal separator => POS style entry, preceded by math evaluation
    else if (this.isMathExpressionNoDecimals(input)) {
      const evalResult = this.#evaluateMath(input);
      const mathResult = evalResult * posMultiplier;
      const resultAsString = mathResult.toString();

      result = this.#normalizeEditValue(resultAsString);
    }

    // Case 4 - Unexpected input, do not change at all
    else {
      result = input;
    }

    return result;
  }

  #loadCurrency(): YNABCurrencyInformation {
    if (this.currency == null) {
      this.currency = this.formatter.getCurrency();
    }
    return this.currency;
  }

  #normalizeEditValue(value: string | number | undefined) {
    if (value === '') return '';
    if (!value) return 0;

    const unformatted = this.formatter.unformat(value);
    const capped = this.#capValueMillis(unformatted);
    const formatted = this.formatter.format(capped);
    return formatted;
  }

  #capValueMillis(e: number) {
    return Math.max(Math.min(e, this.maxValueMillis), -this.maxValueMillis);
  }

  #evaluateMath(expression: string) {
    try {
      return Math.round(this.#getToolkitMathInstance().evaluate(expression));
    } catch (_) {
      return 0;
    }
  }

  #getToolkitMathInstance() {
    if (!this.toolkitMathInstance) {
      this.toolkitMathInstance = new ToolkitMath();
    }
    return this.toolkitMathInstance;
  }
}
