import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';

export class BulkManagePayees extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('modal', 'didRender', this.insertManagePayees, {
      guard: () => document.querySelector('.modal-account-edit-transaction-list') !== null,
    });
  }

  destroy() {
    $('#tk-manage-payees, #tk-manage-payees + li').remove();
  }

  insertManagePayees(element) {
    if (element.querySelector('#tk-manage-payees') !== null) {
      return;
    }

    const menuText = l10n('toolkit.accountsBulkManagePayees', 'Manage Payees');

    // Note that ${menuText} was intentionally placed on the same line as the <i> tag to
    // prevent the leading space that occurs as a result of using a multi-line string.
    // Using a dedent function would allow it to be placed on its own line which would be
    // more natural.
    //
    // The second <li> functions as a separator on the menu after the feature menu item.
    $('.modal-account-edit-transaction-move').before(
      $(`<li id="tk-manage-payees">
          <button class="toolkit-modal-select-budget-manage-payees">
            <i class="ynab-new-icon ember-view flaticon stroke group"><!----></i>${menuText}
          </button>
        </li>
        <li><hr /><li>
      `).on('click', () => {
        controllerLookup('accounts').send('openPayeeModal');
      })
    );
  }
}
