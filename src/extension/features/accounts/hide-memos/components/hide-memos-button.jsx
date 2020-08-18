import * as React from 'react';
import * as PropTypes from 'prop-types';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n, getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export const HideMemosButton = ({ toggleHiddenState }) => {
  const notHidden = getToolkitStorageKey('hide-memos', true);
  const label = notHidden ? 'is-checked' : 'not-checked';

  const toggleHidden = () => {
    toggleHiddenState(!notHidden);
    controllerLookup('application').send('closeModal');
  };

  return (
    <div className="modal-account-view-menu">
      <button
        onClick={toggleHidden}
        className={`${label}`}
        aria-label="Check Hide Memo Column"
        role="checkbox"
      >
        <div className={`flaticon stroke ynab-checkbox-button-square ${label}`}></div>
      </button>
      <label className="label-checkbox">
        {` `}
        {l10n('toolkit.hideMemoColumn', 'Show Memo Column')}
      </label>
    </div>
  );
};

HideMemosButton.propTypes = {
  toggleHiddenState: PropTypes.func.isRequired,
};
