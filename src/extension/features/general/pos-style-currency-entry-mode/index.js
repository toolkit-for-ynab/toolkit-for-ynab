import { Feature } from 'toolkit/extension/features/feature';
import { componentLookup } from 'toolkit/extension/utils/ember';
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
    const {
      currencyFormatter,
    } = ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;

    this.currencyFormatter = currencyFormatter;
    this.accountCurrency = currencyFormatter.getCurrency();
    this.decimalDigits = this.accountCurrency.decimal_digits;

    // When 0, there are no currency sub-units => POS style entry is unneeded
    return this.decimalDigits > 0;
  }

  invoke() {
    this.wrapCurrencyInput('ynab-new-currency-input');
  }

  wrapCurrencyInput(name) {
    const self = this;

    const newCurrencyInputComponent = componentLookup(name);
    const originalNewCurrencyInputComponentActions = Object.getPrototypeOf(
      newCurrencyInputComponent
    ).actions;
    const originalNewCurrencyInputComponentCallback =
      originalNewCurrencyInputComponentActions.commitValue;

    originalNewCurrencyInputComponentActions.commitValue = function() {
      const newArgs = [].slice.call(arguments);
      newArgs.push(self, originalNewCurrencyInputComponentCallback);
      self.commitValueWrapper.apply(this, newArgs);
    };
  }

  commitValueWrapper() {
    const editValue = this.get('editValue');
    const originalArgs = [].slice.call(arguments);
    const originalCallback = originalArgs.pop();
    const self = originalArgs.pop();

    const decimalSeparator = self.accountCurrency.decimal_separator;
    const posMultiplier = self.currencyFormatter.fixed_precision_amount / 10 ** self.decimalDigits;

    // Digits only => POS style entry
    if (/^-?\d+$/.test(editValue)) {
      let intValue = parseInt(editValue) * posMultiplier;
      this.set('editValue', this.normalizeEditValue(intValue));
    }
    // Digits with "-" suffix, shorthand for full denomination entry (e.g. "5-" == "5.00")
    else if (/^-?\d+-$/.test(editValue)) {
      this.set('editValue', editValue.substring(0, editValue.length - 1));
    }
    // Digits with math operators => POS style entry, preceded by math evaluation
    else if (!editValue.includes(decimalSeparator) && /[-*+/^%]/.test(editValue)) {
      // Transformation of decimal separator simplifies Toolkit's math computation logic
      const normalizedExpression = editValue.replace(new RegExp(`/\\${decimalSeparator}/g`), '.');
      const mathResult = self.evaluateMath(normalizedExpression) * posMultiplier;
      const formattedResult = mathResult.toString().replace(/[,]/g, decimalSeparator);

      this.set('editValue', this.normalizeEditValue(formattedResult));
    }

    originalCallback.apply(this, originalArgs);
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
