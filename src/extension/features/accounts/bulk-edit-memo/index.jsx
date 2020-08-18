import React, { useState, useEffect } from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook, l10n } from 'toolkit/extension/utils/toolkit';
import { componentAfter } from 'toolkit/extension/utils/react';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

const EditMemo = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [memoInputValue, setMemoInputValue] = useState('');

  const handleConfirm = e => {
    const checkedRows = controllerLookup('accounts').get('areChecked');
    const { transactionsCollection } = getEntityManager();
    getEntityManager().performAsSingleChangeSet(() => {
      checkedRows.forEach(transaction => {
        const entity = transactionsCollection.findItemByEntityId(transaction.get('entityId'));
        if (entity) {
          entity.set('memo', memoInputValue);
        }
      });
    });

    controllerLookup('accounts').send('closeModal');
  };

  return (
    <>
      <li className="tk-bulk-edit-memo">
        {isEditMode && (
          <div className="button-list">
            <input
              autoFocus
              className="accounts-text-field"
              value={memoInputValue}
              onChange={e => setMemoInputValue(e.target.value)}
            />
            <div className="tk-grid-actions">
              <button
                className="button button-cancel tk-memo-cancel"
                onClick={() => setIsEditMode(false)}
              >
                {l10n('toolkit.editMemoCancel', 'Cancel')}
              </button>
              <button className="button button-primary tk-memo-save" onClick={handleConfirm}>
                {l10n('toolkit.editMemoSave', 'Save')}
              </button>
            </div>
          </div>
        )}
        {!isEditMode && (
          <button onClick={() => setIsEditMode(true)}>
            <i className="flaticon stroke document-1 ynab-new-icon"></i>
            {controllerLookup('accounts').get('areChecked').length === 1
              ? l10n('toolkit.editMemo', 'Edit Memo')
              : l10n('toolkit.editMemoOther', 'Edit Memos')}
          </button>
        )}
      </li>
      <li>
        <hr />
      </li>
    </>
  );
};

export class BulkEditMemo extends Feature {
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
      this.injectBulkEditMemo
    );
  }

  injectBulkEditMemo = element => {
    const categorizeRow = $(
      '.modal-account-edit-transaction-list li:contains("Categorize")',
      element
    );
    componentAfter(<EditMemo />, categorizeRow);
  };
}
