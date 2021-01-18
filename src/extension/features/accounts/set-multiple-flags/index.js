import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook, getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

const FLAG_COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];

export class SetMultipleFlags extends Feature {
  get _checkedRows() {
    return controllerLookup('accounts').get('areChecked');
  }

  get _isAnyCheckedTransactionFlagged() {
    return this._checkedRows.some(transaction => transaction.get('flag'));
  }

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(
      this,
      'modals/register/edit-transactions',
      'didInsertElement',
      this._injectButtons
    );
  }

  _closeModal() {
    controllerLookup('application').send('closeModal');
  }

  _injectButtons(element) {
    const $editModal = $('.modal-account-edit-transaction-list', element);

    if (!$('#tk-add-flags', $editModal).length) {
      $('hr', $editModal)
        .first()
        .parent()
        .after(
          $(`
        <li id="tk-add-flags">
          <button class="button-list tk-multi-flags__button">
            <svg class="ynab-flag ynab-flag-header ynab-new-icon">
              <g>
                <path d="M 0,4 16,4 12,9 16,14 0,14 z"></path>
              </g>
            </svg>
            Set Flag${this._checkedRows.length > 1 ? 's' : ''}
          </button>
        </li>
      `).click(this._handleAddFlags)
        );
    }

    if (!$('#tk-remove-flags', $editModal).length) {
      $('#tk-add-flags', $editModal).after(
        $(`
        <li id="tk-remove-flags">
          <button class="button-list tk-multi-flags__button ${
            !this._isAnyCheckedTransactionFlagged ? 'button-disabled' : ''
          }">
            <svg class="ynab-flag ynab-flag-none ynab-new-icon">
              <g>
                <path d="M 0,4 16,4 12,9 16,14 0,14 z"></path>
              </g>
            </svg>
            Remove Flag${this._checkedRows.length > 1 ? 's' : ''}
          </button>
        </li>
      `).click(this._handleRemoveFlags)
      );
    }

    if (!$('#tk-separator', $editModal).length) {
      $('#tk-remove-flags', $editModal).after($('<li id="tk-separator"><hr></li>'));
    }
  }

  _handleAddFlags = () => {
    const customColorNames = getToolkitStorageKey('flags');

    $('.modal-account-edit-transaction-list')
      .removeClass('modal-account-edit-transaction-list')
      .addClass('modal-account-flags');
    const $modalList = $('.modal-list').empty();
    FLAG_COLORS.forEach(color => {
      let colorDisplayName = color;
      if (ynabToolKit.options.CustomFlagNames) {
        colorDisplayName = customColorNames[color.toLowerCase()].label;
      }

      $modalList.append(
        $('<li>').append(
          $('<button>', { class: `ynab-flag-${color.toLowerCase()}` })
            .click(() => this._applyColor(color))
            .append($('<div>', { class: 'label-bg', text: colorDisplayName }))
            .append($('<div>', { class: 'label', text: colorDisplayName }))
        )
      );
    });
  };

  _handleRemoveFlags = () => {
    if (!this._isAnyCheckedTransactionFlagged) {
      return this._closeModal();
    }

    this._applyColor('');
  };

  _applyColor = color => {
    const { transactionsCollection } = getEntityManager();
    getEntityManager().batchChangeProperties(() => {
      this._checkedRows.forEach(transaction => {
        const entity = transactionsCollection.findItemByEntityId(transaction.get('entityId'));
        if (entity) {
          entity.set('flag', color);
        }
      });
    });

    this._closeModal();
  };
}
