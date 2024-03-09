import { ToolkitMath } from 'toolkit/extension/utils/math';

export class POSStyleParser {
  constructor(currencyFormatter) {
    this.formatter = currencyFormatter;
    this.maxValueMillis = 1e15;

    this.currency = null;
    this.toolkitMathInstance = null;
  }

  isOnlyDigitsAndSign(input) {
    return /^-?\d+$/.test(input);
  }

  isDigitsWithPostfix(input) {
    return /^-?\d+-$/.test(input);
  }

  isMathExpressionNoDecimals(input) {
    const separatorRegex = new RegExp(`${this.currency.decimal_separator}`);
    return /[-*+/^%]/.test(input) && !input.endsWith('-') && !separatorRegex.test(input);
  }

  determineValue(input) {
    this.#loadCurrency();

    const posMultiplier =
      this.formatter.fixed_precision_amount / 10 ** this.currency.decimal_digits;

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

  #loadCurrency() {
    this.currency = this.formatter.getCurrency();
  }

  #normalizeEditValue(value) {
    if (value === '') return '';
    if (!value) return 0;

    const unformatted = this.formatter.unformat(value);
    const capped = this.#capValueMillis(unformatted);
    const formatted = this.formatter.format(capped);
    return formatted;
  }

  #cleanString(value) {
    const unformatInput = typeof value === 'string' ? value.replace(/−/, '-') : value;
    const unformatted = this.formatter.unformat(unformatInput);
    return this.formatter.convertToMilliUnits(unformatted);
  }

  #capValueMillis(e) {
    return Math.max(Math.min(e, this.maxValueMillis), -this.maxValueMillis);
  }

  #evaluateMath(expression) {
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
