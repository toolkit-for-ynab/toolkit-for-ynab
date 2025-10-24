import React, { useState } from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { containerLookup } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { componentAfter } from 'toolkit/extension/utils/react';
import { getEntityManager, getModalService } from 'toolkit/extension/utils/ynab';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

const EditDate = () => {
  const [editing, setEditing] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');

  const handleConfirm = () => {
    try {
      // @ts-ignore
      const checkedRows = containerLookup('service:accounts').areChecked;

      getEntityManager().performAsSingleChangeSet(() => {
        checkedRows.forEach((transaction: YNABTransaction) => {
          const entity = getEntityManager().getTransactionById(transaction.entityId);

          if (entity) {
            entity.date = ynab.utilities.DateWithoutTime.createFromISOString(dateInputValue);
          }
        });
      });

      setEditing(false);
      const modal = getModalService();
      if (modal !== undefined && modal.closeModal !== undefined) {
        modal.closeModal();
      } else {
        console.error('Modal service is undefined or does not have a closeModal method.');
      }
    } catch (error) {
      console.error('Error updating transaction dates:', error);
    }
  };

  // @ts-ignore
  const selectedTransactionsCount = containerLookup('service:accounts').areChecked.length;
  const makeEditLabel = () =>
    selectedTransactionsCount === 1
      ? l10n('toolkit.editDateOne', 'Edit Date')
      : l10n('toolkit.editDateMany', 'Edit Dates');

  return (
    <li className="tk-bulk-edit-date">
      {!editing && (
        <button className="button-list" onClick={() => setEditing(true)}>
          <svg className="ynab-new-icon" width="16" height="16">
            <use href="#icon_sprite_document"></use>
          </svg>
          {makeEditLabel()}
        </button>
      )}
      {editing && (
        <div className="tk-date-edit-container">
          <input
            id="tk-bulk-edit-date-input"
            type="date"
            autoFocus
            className="accounts-text-field tk-date-input"
            value={dateInputValue}
            onChange={(e) => setDateInputValue(e.target.value)}
          />
          <div className="tk-grid-actions">
            <button
              className="button button-cancel tk-date-cancel"
              onClick={() => setEditing(false)}
            >
              {l10n('toolkit.editDateCancel', 'Cancel')}
            </button>
            <button
              id="tk-bulk-edit-date-save"
              className="button button-primary tk-date-save"
              onClick={handleConfirm}
              disabled={!dateInputValue}
            >
              {l10n('toolkit.editDateSave', 'Save')}
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export class BulkEditDate extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  observe(changedNodes: Set<string>) {
    if (
      changedNodes.has('modal-overlay active ynab-u modal-popup modal-account-register-action-bar')
    ) {
      const element = document.querySelector('.modal-account-register-action-bar');
      if (element) {
        this.injectBulkEditDate(element);
      }
    }
  }

  destroy() {
    $('.tk-bulk-edit-date, .tk-bulk-edit-date + li').remove();
  }

  injectBulkEditDate = (element: Element) => {
    const categorizeRow = $('li:contains("Categorize")', element);
    if (!categorizeRow.length) {
      return;
    }

    componentAfter(<EditDate />, categorizeRow[0]);
  };
}
