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
    if (!memoInputValue) {
      return;
    }

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
  };

  return (
    <li>
      {isEditMode && (
        <>
          <input value={memoInputValue} onChange={e => setMemoInputValue(e.target.value)} />
          <button onClick={handleConfirm}>Okay</button>
          <button onClick={() => setIsEditMode(false)}>Cancel</button>
        </>
      )}
      {!isEditMode && <button onClick={() => setIsEditMode(true)}>Edit Memo</button>}
    </li>
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
    const categorizeRow = $('.modal-account-edit-transaction-list li:contains("Categorize")');
    componentBefore(<EditMemo />, categorizeRow);
  }
}
