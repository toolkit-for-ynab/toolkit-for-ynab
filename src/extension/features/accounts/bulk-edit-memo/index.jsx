import React, { useState } from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { containerLookup } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { componentAfter } from 'toolkit/extension/utils/react';
import { getEntityManager, getModalService } from 'toolkit/extension/utils/ynab';

const DEFAULT_DISPLAY_MODE = 'defaultDisplayMode';
const MENU_DISPLAY_MODE = 'menuDisplayMode';
const EDIT_DISPLAY_MODE = 'editDisplayMode';

const REPLACE_EDIT_MODE = 'replaceEditMode';
const ADD_PREFIX_EDIT_MODE = 'addPrefixEditMode';
const ADD_SUFFIX_EDIT_MODE = 'addSuffixEditMode';

const EditMemo = () => {
  const [displayMode, setDisplayMode] = useState(DEFAULT_DISPLAY_MODE);
  const [editMode, setEditMode] = useState(REPLACE_EDIT_MODE);
  const [memoInputValue, setMemoInputValue] = useState('');

  const makeNewMemo = (prevMemo) => {
    switch (editMode) {
      case REPLACE_EDIT_MODE:
        return memoInputValue;
      case ADD_PREFIX_EDIT_MODE:
        return memoInputValue + ' ' + prevMemo;
      case ADD_SUFFIX_EDIT_MODE:
        return prevMemo + ' ' + memoInputValue;
    }
    return memoInputValue;
  };

  const handleConfirm = () => {
    const checkedRows = containerLookup('service:accounts').areChecked;
    const { transactionsCollection } = getEntityManager();
    getEntityManager().performAsSingleChangeSet(() => {
      checkedRows.forEach((transaction) => {
        const entity = transactionsCollection.findItemByEntityId(transaction.get('entityId'));
        const memoPrevValue = transaction.get('memo') || '';
        if (entity) {
          entity.set('memo', makeNewMemo(memoPrevValue));
        }
      });
    });

    setDisplayMode(DEFAULT_DISPLAY_MODE);
    getModalService().closeModal();
  };

  const selectedTransactionsCount = containerLookup('service:accounts').areChecked.length;
  const makeEditLabel = () =>
    selectedTransactionsCount === 1
      ? l10n('toolkit.editMemoOne', 'Edit Memo')
      : l10n('toolkit.editMemoMany', 'Edit Memos');
  const makeReplacelabel = () =>
    selectedTransactionsCount === 1
      ? l10n('toolkit.editMemoReplaceOne', 'Replace memo')
      : l10n('toolkit.editMemoReplaceMany', 'Replace memos');
  const makeAddPrefixLabel = () =>
    selectedTransactionsCount === 1
      ? l10n('toolkit.editMemoPrefixOne', 'Add prefix to memo')
      : l10n('toolkit.editMemoPrefixMany', 'Add prefix to each memo');
  const makeAddSuffixLabel = () =>
    selectedTransactionsCount === 1
      ? l10n('toolkit.editMemoSuffixOne', 'Add suffix to memo')
      : l10n('toolkit.editMemoSuffixMany', 'Add suffix to each memo');

  return (
    <>
      <li className="tk-bulk-edit-memo">
        {displayMode === DEFAULT_DISPLAY_MODE && (
          <button className="button-list" onClick={() => setDisplayMode(MENU_DISPLAY_MODE)}>
            <i className="flaticon stroke document-1 ynab-new-icon"></i>
            {makeEditLabel()}
          </button>
        )}
        {displayMode === MENU_DISPLAY_MODE && (
          <>
            <button
              autoFocus
              className="button-list"
              onClick={() => {
                setDisplayMode(EDIT_DISPLAY_MODE);
                setEditMode(REPLACE_EDIT_MODE);
              }}
            >
              {makeReplacelabel()}
            </button>
            <button
              className="button-list"
              onClick={() => {
                setDisplayMode(EDIT_DISPLAY_MODE);
                setEditMode(ADD_PREFIX_EDIT_MODE);
              }}
            >
              {makeAddPrefixLabel()}
            </button>
            <button
              className="button-list"
              onClick={() => {
                setDisplayMode(EDIT_DISPLAY_MODE);
                setEditMode(ADD_SUFFIX_EDIT_MODE);
              }}
            >
              {makeAddSuffixLabel()}
            </button>
            <button
              className="button-list button-cancel tk-memo-cancel"
              onClick={() => setDisplayMode(DEFAULT_DISPLAY_MODE)}
            >
              {l10n('toolkit.editMemoCancel', 'Cancel')}
            </button>
          </>
        )}
        {displayMode === EDIT_DISPLAY_MODE && (
          <>
            {editMode === REPLACE_EDIT_MODE && (
              <li className="button-list button-disabled">{makeReplacelabel()}</li>
            )}
            {editMode === ADD_PREFIX_EDIT_MODE && (
              <li className="button-list button-disabled">{makeAddPrefixLabel()}</li>
            )}
            {editMode === ADD_SUFFIX_EDIT_MODE && (
              <li className="button-list button-disabled">{makeAddSuffixLabel()}</li>
            )}
            <div className="button-list">
              <input
                autoFocus
                className="accounts-text-field"
                value={memoInputValue}
                onChange={(e) => setMemoInputValue(e.target.value)}
              />
              <div className="tk-grid-actions">
                <button
                  className="button button-cancel tk-memo-cancel"
                  onClick={() => setDisplayMode(MENU_DISPLAY_MODE)}
                >
                  {l10n('toolkit.editMemoBack', 'Back')}
                </button>
                <button className="button button-primary tk-memo-save" onClick={handleConfirm}>
                  {l10n('toolkit.editMemoSave', 'Save')}
                </button>
              </div>
            </div>
          </>
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
    this.addToolkitEmberHook(
      'modals/register/edit-transactions',
      'didInsertElement',
      this.injectBulkEditMemo,
      {
        guard: () => document.querySelector('.modal-account-edit-transaction-list') !== null,
      }
    );
  }

  destroy() {
    $('.tk-bulk-edit-memo, .tk-bulk-edit-memo + li').remove();
  }

  injectBulkEditMemo = (element) => {
    const categorizeRow = $('li:contains("Categorize")', element);
    if (!categorizeRow.length) {
      return;
    }

    componentAfter(<EditMemo />, categorizeRow[0]);
  };
}
