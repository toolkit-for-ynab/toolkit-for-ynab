import React, { useState } from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { componentBefore } from 'toolkit/extension/utils/react';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

const EditMemo = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [memoInputValue, setMemoInputValue] = useState('');

  const handleConfirm = e => {
    const checkedRows = controllerLookup('accounts').get('areChecked');
    const { transactionsCollection } = getEntityManager();
    getEntityManager().batchChangeProperties(() => {
      checkedRows.forEach(transaction => {
        const entity = transactionsCollection.findItemByEntityId(transaction.get('entityId'));
        if (entity) {
          entity.set('memo', memoInputValue);
        }
      });
    });
    setIsEditMode(false);
  };

  return (
    <>
      <li className="tk-bulk-edit-memo">
        <div className="button-list">
          {isEditMode && (
            <>
              <input
                autoFocus
                className="accounts-text-field"
                value={memoInputValue}
                onChange={e => setMemoInputValue(e.target.value)}
              />
              <div className="ynab-grid-actions tk-grid-actions">
                <button
                  className="button button-cancel tk-memo-cancel"
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </button>
                <button className="button button-primary tk-memo-save" onClick={handleConfirm}>
                  Save
                </button>
              </div>
            </>
          )}
          {!isEditMode && (
            <button onClick={() => setIsEditMode(true)}>
              <i className="flaticon stroke document-1 ynab-new-icon"></i>Edit Memo
            </button>
          )}
        </div>
      </li>
      <li>
        <hr />
      </li>
    </>
  );
};

export class BulkEditMemo extends Feature {
  shouldInvoke() {
    return false;
  }

  observe(changedNodes) {
    if (
      changedNodes.has(
        'ynab-u modal-popup modal-account-edit-transaction-list modal-overlay active'
      )
    ) {
      this.invoke();
    }
  }

  invoke() {
    const approveRow = $('.modal-account-edit-transaction-list li:contains("Approve")');
    componentBefore(<EditMemo />, approveRow);
  }

  injectCSS() {
    return require('./index.css');
  }
}
