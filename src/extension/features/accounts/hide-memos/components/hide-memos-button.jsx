import * as React from 'react';
import * as PropTypes from 'prop-types';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n, getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export const HideMemosButton = ({ toggleHiddenState }) => {
  const notHidden = getToolkitStorageKey('hide-memos', true);
  const label = notHidden ? l10n('app.show', 'is-checked') : l10n('app.hide', 'not-checked');

  const toggleHidden = () => {
    toggleHiddenState(!notHidden);
    controllerLookup('application').send('closeModal');
    document.getElementById('ember1434').remove();
  };

  return (
    <div
      title="Hide Memo Column"
      id="ember1434"
      className="modal-account-view-menu ynab-checkbox ember-view"
    >
      <button
        onClick={toggleHidden}
        className={`ynab-checkbox-button js-ynab-checkbox-button ${label}`}
        aria-label="Check Hide Memo Column"
        role="checkbox"
      >
        <div className={`flaticon stroke ynab-checkbox-button-square ${label}`}></div>
      </button>
      <label className="label-checkbox">&nbsp;Hide Memo Column</label>
    </div>
  );
};

HideMemosButton.propTypes = {
  toggleHiddenState: PropTypes.func.isRequired,
};
