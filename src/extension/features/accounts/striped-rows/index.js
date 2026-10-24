import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

const STRIPED_ROW_CLASS = 'tk-striped-transaction-row';
const EXCLUDED_ROW_CLASSES = [
  'ynab-grid-collapsible-transactions-toggle',
  'is-scheduled',
  'ynab-grid-spacer',
];

const EXCLUDED_ROW_CLASSES_SELECTOR = `:not(.${EXCLUDED_ROW_CLASSES.join('):not(.')})`;

export class AccountsStripedRows extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    this.setTimeout();
  }

  // This used to run from Ember render hooks that no longer exist. Restriping
  // only changes rows whose stripe is wrong, so the class changes it makes
  // settle after one pass.
  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-body') || changedNodes.has('ynab-grid-body-row')) {
      this.setTimeout();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  destroy() {
    $(`.${STRIPED_ROW_CLASS}`).removeClass(STRIPED_ROW_CLASS);
  }

  setTimeout() {
    if (this.timeoutHandle != null) {
      return;
    }

    this.timeoutHandle = setTimeout(this.updateStripes.bind(this), 0);
  }

  updateStripes() {
    this.timeoutHandle = null;

    const rows = $(`div.ynab-grid-body-row${EXCLUDED_ROW_CLASSES_SELECTOR}`);

    let stripeEvenRows = true;
    rows.each(function (index) {
      if (this.classList.contains(STRIPED_ROW_CLASS)) {
        stripeEvenRows = index % 2 === 0;
        return false;
      }
    });

    rows.each(function (index) {
      const isEvenRow = index % 2 === 0;
      if (isEvenRow !== stripeEvenRows && this.classList.contains(STRIPED_ROW_CLASS)) {
        this.classList.remove(STRIPED_ROW_CLASS);
      } else if (isEvenRow === stripeEvenRows && !this.classList.contains(STRIPED_ROW_CLASS)) {
        this.classList.add(STRIPED_ROW_CLASS);
      }
    });
  }
}
