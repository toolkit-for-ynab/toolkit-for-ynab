import { Feature } from 'toolkit/extension/features/feature';
import { ToolkitMath } from 'toolkit/extension/utils/math';

export class POSStyleCurrencyEntryMode extends Feature {
  constructor() {
    super();

    this.mathEvaluatorInstance = null;
    this.currencyFormatter = null;
    this.accountCurrency = null;
    this.decimalDigits = null;
  }

  shouldInvoke() {
    if (!$('.ynab-grid-body-row.is-editing').length) {
      return false;
    }

    const { currencyFormatter } =
      ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;

    this.currencyFormatter = currencyFormatter;
    this.accountCurrency = currencyFormatter.getCurrency();
    this.decimalDigits = this.accountCurrency.decimal_digits;

    // When 0, there are no currency sub-units => POS style entry is unneeded
    return this.decimalDigits > 0;
  }

  invoke() {
    const $editRows = $('.ynab-grid-body-row.is-editing');
    const $editInputs = $('.ynab-grid-cell-outflow input, .ynab-grid-cell-inflow input', $editRows);
    $editInputs.each((_, input) => {
      if (!input.getAttribute('ynab-tk-evtl-listener')) {
        input.setAttribute('ynab-tk-evtl-listener', true);
        input.addEventListener('keydown', this.handleKeydown);
      }
    });
  }

  destroy() {
    const $editInputs = $('input[ynab-tk-evtl-listener]');
    $editInputs.each((_, input) => {
      input.removeAttribute('ynab-tk-evtl-listener');
      input.removeEventListener('keydown', this.handleKeydown.bind(this));
    });
  }

  handleKeydown(event) {
    if (event.keyCode === 13) {
      const currentValue = event.currentTarget.value;

      const { currencyFormatter } =
        ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;
      const accountCurrency = currencyFormatter.getCurrency();
      const decimalDigits = accountCurrency.decimal_digits;
      const decimalSeparator = accountCurrency.decimal_separator;

      const formatFloatValue = (val) =>
        currencyFormatter.format(currencyFormatter.convertToMilliUnits(val));

      const convertWithPosFactor = (val) => val / 10 ** decimalDigits;

      let newValueString;

      // Digits only => POS style entry
      if (/^-?\d+$/.test(currentValue)) {
        const newValue = convertWithPosFactor(parseInt(currentValue));
        newValueString = formatFloatValue(newValue);
      }
      // Digits with "-" suffix, shorthand for full denomination entry (e.g. "5-" == "5.00")
      else if (/^-?\d+-$/.test(currentValue)) {
        newValueString = currentValue.substring(0, currentValue.length - 1);
      }
      // Digits with math operators => POS style entry, preceded by math evaluation
      else if (!currentValue.includes(decimalSeparator) && /[-*+/^%]/.test(currentValue)) {
        // Transformation of decimal separator simplifies Toolkit's math computation logic
        const normalizedExpression = currentValue.replace(
          new RegExp(`/\\${decimalSeparator}/g`),
          '.'
        );
        const mathResult = convertWithPosFactor(this.evaluateMath(normalizedExpression));

        newValueString = formatFloatValue(mathResult);
      }

      // todo the value added in YNAB is not influenced here - determine where it is set
      event.currentTarget.value = newValueString;
    }
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  evaluateMath(expression) {
    try {
      return Math.round(this.mathEvaluator().evaluate(expression));
    } catch (_) {
      return 0;
    }
  }

  mathEvaluator() {
    if (this.mathEvaluatorInstance) {
      return this.mathEvaluatorInstance;
    }

    this.mathEvaluatorInstance = new ToolkitMath();

    return this.mathEvaluatorInstance;
  }
}
