import { Feature } from 'toolkit/extension/features/feature';
import { ToolkitMath } from 'toolkit/extension/utils/math';

/** This attribute is used to mark inputs which have been changed by this feature. */
const customInputAttribute = 'ynab-tk-evtl-listener';

export class POSStyleCurrencyEntryMode extends Feature {
  constructor() {
    super();

    this.mathEvaluatorInstance = null;
    this.currencyFormatter = null;
    this.accountCurrency = null;
    this.decimalDigits = null;

    this.handleKeydownWithBind = this.#handleKeydown.bind(this);
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
      if (!input.getAttribute(customInputAttribute)) {
        input.setAttribute(customInputAttribute, true);
        input.addEventListener('keydown', this.handleKeydownWithBind, true);
      }
    });
  }

  destroy() {
    const $editInputs = $(`input[${customInputAttribute}]`);
    $editInputs.each((_, input) => {
      input.removeAttribute(customInputAttribute);
      input.removeEventListener('keydown', this.handleKeydownWithBind);
    });
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  #handleKeydown(event) {
    // This method catches the KeyDown Event when enter is pressed, and then aborts event
    // propagation before changing the value and dispatching artifical events, so YNAB
    // only sees the new value

    // do not catch artificial followup events
    if (event._wasHandled) {
      return;
    }

    if (event.keyCode === 13) {
      const userInput = event.currentTarget.value;
      const parsedValue = this.#determineValueFromPosInput(userInput);

      event.currentTarget.value = parsedValue;
      event.stopImmediatePropagation();
      this.#dispatchArtificialEvents(event, parsedValue);
    }
  }

  #dispatchArtificialEvents(event, newValue) {
    // both the inputEvent and the keydownEvent need to be sent, because YNAB saves the current
    // value from the input event, but performs the save action in the keydown event
    const { newInputEvent, newKeydownEvent } = this.#createArtificialInputEvents(event, newValue);
    const eventTarget = event.currentTarget;

    setTimeout(() => {
      eventTarget.dispatchEvent(newInputEvent);
      eventTarget.dispatchEvent(newKeydownEvent);
    });
  }

  #createArtificialInputEvents(originalEvent, parsedValue) {
    const newKeydownEvent = new KeyboardEvent('keydown', {
      code: originalEvent.code,
      key: originalEvent.key,
      keyCode: originalEvent.keyCode,
      which: originalEvent.which,
      bubbles: true,
      cancelable: true,
    });
    newKeydownEvent._wasHandled = true; // marker for the artificial event

    const newInputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
      data: parsedValue,
    });
    return { newInputEvent, newKeydownEvent };
  }

  #determineValueFromPosInput(currentValue) {
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
      const mathResult = convertWithPosFactor(this.#evaluateMath(normalizedExpression));

      newValueString = formatFloatValue(mathResult);
    } else {
      newValueString = currentValue;
    }
    return newValueString;
  }

  #evaluateMath(expression) {
    try {
      return Math.round(this.#mathEvaluator().evaluate(expression));
    } catch (_) {
      return 0;
    }
  }

  #mathEvaluator() {
    if (this.mathEvaluatorInstance) {
      return this.mathEvaluatorInstance;
    }

    this.mathEvaluatorInstance = new ToolkitMath();

    return this.mathEvaluatorInstance;
  }
}
