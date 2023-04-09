import { Feature } from 'toolkit/extension/features/feature';
import { serviceLookup } from 'toolkit/extension/utils/ember';
import { getRegisterGridService } from 'toolkit/extension/utils/ynab';

export class ResetColumnWidths extends Feature {
  addButton() {
    if (document.querySelector('#tk-reset-column-widths')) {
      return;
    }

    $('.modal-account-view-options .modal-actions').append(
      $('<button>', {
        class: 'button button-cancel',
        text: 'Reset Column Widths',
      })
        .css({ float: 'left' })
        .on('click', () => {
          getRegisterGridService()?.saveColumnSizes();
        })
    );
  }

  observe(changedNodes: Set<string>) {
    if (changedNodes.has('modal-overlay active  ynab-u modal-generic modal-account-view-options')) {
      this.addButton();
    }
  }
}
