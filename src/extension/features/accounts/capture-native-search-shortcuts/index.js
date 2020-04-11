import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { isPlatformMac } from 'toolkit/extension/utils/platform';

export class CaptureNativeSearchShortcuts extends Feature {
  constructor() {
    super();

    this.previousActiveElement = null;
    this.searchInput = null;
    this.windowKeydownHandlerAdded = false;
  }

  onRouteChanged() {
    this.searchInput = null;

    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  shouldInvoke() {
    if (!isCurrentRouteAccountsPage()) return false;

    return this.$detectSearchInput().length > 0;
  }

  invoke() {
    if (this.windowKeydownHandlerAdded === false) {
      this.addGlobalKeydownHandler();
      this.windowKeydownHandlerAdded = true;
    }

    this.addSearchInputHandlers();
  }

  addGlobalKeydownHandler() {
    const self = this;

    $(window).on('keydown', e => {
      if (!self.searchInput) return;
      if (!self.isSearchKeyComboPressed(e)) return;

      e.preventDefault();
      self.previousActiveElement = document.activeElement;

      return self
        .$searchInput()
        .focus()
        .trigger('focusin');
    });
  }

  addSearchInputHandlers() {
    const self = this;
    const searchBlurKeyboardEventCode = 'Escape';

    this.$searchInput().on('keydown', e => {
      if (self.isSearchKeyComboPressed(e)) {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.code === searchBlurKeyboardEventCode) {
        let $previousElement = $(this.previousActiveElement);

        e.preventDefault();
        self.$searchInput().trigger('focusout');

        return $previousElement.length ? $previousElement.focus() : true;
      }
    });
  }

  isSearchKeyComboPressed(e) {
    const searchFocusKeyboardEventCode = 'KeyF';

    return e.code === searchFocusKeyboardEventCode && this.isSearchModifierKeyPressed(e);
  }

  isSearchModifierKeyPressed(e) {
    return isPlatformMac() ? e.metaKey : e.ctrlKey;
  }

  $searchInput() {
    if (this.searchInput) return this.searchInput;

    this.searchInput = this.$detectSearchInput();
    return this.searchInput;
  }

  $detectSearchInput() {
    return $('.transaction-search');
  }
}
