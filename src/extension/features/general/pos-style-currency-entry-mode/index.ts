import { Feature } from 'toolkit/extension/features/feature';
import { POSStyleParser as PosStyleInputParser } from './pos-style-parser';

/** This attribute is used to mark inputs which have been changed by this feature. */
const customInputAttribute = 'ynab-tk-evtl-listener';

type InternalKeyboardEvent = KeyboardEvent & { _wasHandled?: boolean };

/**
 * This features allows entry of currency values without decimal separators
 * (as done in real-life on POS terminals). See the description in settings.js for
 * more details.
 */
export class POSStyleCurrencyEntryMode extends Feature {
  currencyFormatter: YNABCurrencyFormatter | null = null;
  accountCurrency: YNABCurrencyInformation | null = null;
  decimalDigits: number | null = null;
  posStyleParser: PosStyleInputParser | null = null;
  handleKeydownWithBind: (event: InternalKeyboardEvent) => void;

  constructor() {
    super();

    this.handleKeydownWithBind = this.handleKeydownInternal.bind(this);
  }

  shouldInvoke() {
    if (!$('.ynab-grid-body-row.is-editing').length) {
      return false;
    }

    const { currencyFormatter } =
      ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;

    this.posStyleParser = new PosStyleInputParser(currencyFormatter);

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
        input.setAttribute(customInputAttribute, 'true');
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

  observe(changedNodes: Set<string>) {
    if (!changedNodes.has('ynab-grid-body')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  handleKeydownInternal(event: InternalKeyboardEvent) {
    // This method catches the KeyDown Event when enter is pressed, and then aborts event
    // propagation before changing the value and dispatching artifical events, so YNAB
    // only sees the new value

    // do not catch artificial followup events
    if (event._wasHandled) {
      return;
    }

    if (event.keyCode === 13) {
      if (!(event.currentTarget instanceof HTMLInputElement)) {
        return;
      }
      const userInput = event.currentTarget.value;
      const parsedValue = this.posStyleParser!.determineValue(userInput);

      const resultAsString = typeof parsedValue === 'string' ? parsedValue : parsedValue.toString();

      event.currentTarget.value = resultAsString;
      event.stopImmediatePropagation();
      this.#dispatchArtificialEvents(event, resultAsString);
    }
  }

  #dispatchArtificialEvents(event: InternalKeyboardEvent, newValue: string) {
    // both the inputEvent and the keydownEvent need to be sent, because YNAB saves the current
    // value from the input event, but performs the save action in the keydown event
    const { newInputEvent, newKeydownEvent } = this.#createArtificialInputEvents(event, newValue);
    const eventTarget = event.currentTarget as HTMLInputElement;

    setTimeout(() => {
      eventTarget.dispatchEvent(newInputEvent);
      eventTarget.dispatchEvent(newKeydownEvent);
    });
  }

  #createArtificialInputEvents(originalEvent: InternalKeyboardEvent, parsedValue: string) {
    const newKeydownEvent: InternalKeyboardEvent = new KeyboardEvent('keydown', {
      code: originalEvent.code,
      key: originalEvent.key,
      keyCode: originalEvent.keyCode,
      which: originalEvent.which,
      bubbles: true,
      cancelable: true,
    });
    newKeydownEvent._wasHandled = true; // marker for the artificial event

    const newInputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: parsedValue,
    });
    return { newInputEvent, newKeydownEvent };
  }
}
