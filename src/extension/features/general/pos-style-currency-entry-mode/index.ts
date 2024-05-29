import { Feature } from 'toolkit/extension/features/feature';
import { POSStyleParser as PosStyleInputParser } from './pos-style-parser';

/** This attribute is used to mark inputs which have been changed by this feature. */
const customInputAttribute = 'data-toolkit-pos-listener';

type InternalKeyboardEvent = KeyboardEvent & { _wasHandled?: boolean };
type InternalFocusEvent = FocusEvent & { _wasHandled?: boolean };

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

  constructor() {
    super();
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
    // There are 3 scenarios we need to handle:
    // 1. User presses enter when input is focused
    // 2. User presses Tab to move to the next input
    // 3. User clicks away so input loses focus
    // For all these cases we need to tap into 'event flow' and patch input value
    // before YNAB gets a chance to react to original event. Scenarios 1 and 2 handled
    // in handleKeydown function, scenario 3 handled in handleFocusout

    const $editRows = $('.ynab-grid-body-row.is-editing');
    const $editInputs = $('.ynab-grid-cell-outflow input, .ynab-grid-cell-inflow input', $editRows);
    $editInputs.each((_, input) => {
      if (!input.getAttribute(customInputAttribute)) {
        input.setAttribute(customInputAttribute, 'true');
        input.addEventListener('keydown', this.handleKeydown, true);
        input.addEventListener('focusout', this.handleFocusout, true);
      }
    });
  }

  destroy() {
    const $editInputs = $(`input[${customInputAttribute}]`);
    $editInputs.each((_, input) => {
      input.removeAttribute(customInputAttribute);
      input.removeEventListener('keydown', this.handleKeydown, true);
      input.removeEventListener('focusout', this.handleFocusout, true);
    });
  }

  observe(changedNodes: Set<string>) {
    if (!changedNodes.has('ynab-grid-body')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  handleKeydown = (event: InternalKeyboardEvent) => {
    // This method catches the KeyDown Event when enter or tab is pressed, and then aborts event
    // propagation before changing the value and dispatching artifical events, so YNAB
    // only sees the new value

    // do not catch artificial followup events
    if (event._wasHandled || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }

    if (!event.currentTarget.value) {
      return;
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      const value = event.currentTarget.value;
      const result = this.convertInputValue(value);
      event.currentTarget.value = result;
      event.stopImmediatePropagation();
      this.#dispatchArtificialEvents(event, result);
    }
  };

  handleFocusout = (event: InternalFocusEvent) => {
    // This method does roughly the same as handleKeydown but for focusout event

    // do not catch artificial followup events
    if (event._wasHandled || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }

    if (!event.currentTarget.value) {
      return;
    }

    const value = event.currentTarget.value;
    const result = this.convertInputValue(value);
    event.currentTarget.value = result;
    event.stopImmediatePropagation();
    this.#dispatchArtificialEvents(event, result);
  };

  convertInputValue(userInput: string) {
    const parsedValue = this.posStyleParser!.determineValue(userInput);
    const resultAsString = typeof parsedValue === 'string' ? parsedValue : parsedValue.toString();
    return resultAsString;
  }

  #dispatchArtificialEvents(event: InternalKeyboardEvent | InternalFocusEvent, newValue: string) {
    const newInputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: newValue,
    });

    const eventTarget = event.currentTarget as HTMLInputElement;

    if (event instanceof KeyboardEvent) {
      // both the inputEvent and the keydownEvent need to be sent, because YNAB saves the current
      // value from the input event, but performs the save action in the keydown event
      const newKeydownEvent: InternalKeyboardEvent = new KeyboardEvent('keydown', {
        code: event.code,
        key: event.key,
        keyCode: event.keyCode,
        which: event.which,
        bubbles: true,
        cancelable: true,
      });
      newKeydownEvent._wasHandled = true; // marker for the artificial event
      setTimeout(() => {
        eventTarget.dispatchEvent(newInputEvent);
        eventTarget.dispatchEvent(newKeydownEvent);
      });
    } else {
      const newFocusoutEvent: InternalFocusEvent = new FocusEvent('focusout', {
        bubbles: true,
        cancelable: true,
      });
      newFocusoutEvent._wasHandled = true; // marker for the artificial event
      setTimeout(() => {
        eventTarget.dispatchEvent(newInputEvent);
        eventTarget.dispatchEvent(newFocusoutEvent);
      });
    }
  }
}
