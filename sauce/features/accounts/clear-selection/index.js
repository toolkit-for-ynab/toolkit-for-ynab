import { Feature } from 'core/feature';
import {
  getCurrentRouteName,
  getI10Text
} from 'helpers/toolkit';

export class ClearSelection extends Feature {
  constructor() {
    super();
    this.menuText = getI10Text('toolkit.accountsClearSelection', 'Clear Selection');
  }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('account') !== -1;
  }

  invoke() {
    this.addOptionToContextMenu();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-u modal-popup\nmodal-account-edit-transaction-list ember-view modal-overlay active')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  uncheckTransactions() {
    const accountsController = ynabToolKit.shared.containerLookup('controller:accounts');

    try {
      // Clicking the header check box will uncheck all the transaction check boxes otherwise
      // uncheck the rows that are checked.
      if ($('.ynab-grid-header-row button.ynab-checkbox-button.is-checked').length) {
        $('.ynab-grid-header-row button.ynab-checkbox-button.is-checked').trigger('click');
      } else {
        accountsController.get('areChecked').setEach('isChecked', 0);
      }

      accountsController.send('closeModal');
    } catch (e) {
      accountsController.send('closeModal');
      ynabToolKit.shared.showFeatureErrorModal('Clear Selection');
    }
  }

  addOptionToContextMenu() {
    // Note that ${menuText} was intentionally placed on the same line as the <i> tag to
    // prevent the leading space that occurs as a result of using a multi-line string.
    // Using a dedent function would allow it to be placed on its own line which would be
    // more natural.
    //
    // The second <li> functions as a separator on the menu after the feature menu item.
    $('.modal-account-edit-transaction-list .modal-list')
      .prepend(
        $(`<li>
            <button class="button-list ynab-toolkit-clear-selection">
              <i class="flaticon stroke minus-2"></i>${this.menuText}
            </button>
          </li>
          <li><hr /><li>`).click(() => {
            this.uncheckTransactions();
          })
      );
  }
}
