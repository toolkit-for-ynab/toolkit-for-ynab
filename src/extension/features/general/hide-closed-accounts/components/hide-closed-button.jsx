import * as React from 'react';
import * as PropTypes from 'prop-types';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n, getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export const HideClosedButton = ({ toggleHiddenState }) => {
  const isHidden = getToolkitStorageKey('hide-closed', true);
  const label = isHidden ? l10n('app.show', 'Show') : l10n('app.hide', 'Hide');

  const toggleHidden = () => {
    toggleHiddenState(!isHidden);
    controllerLookup('application').send('closeModal');
  };

  return (
    <li onClick={toggleHidden}>
      <button>
        <i className="flaticon stroke no" />
        {` ${label}`} Closed Accounts
      </button>
    </li>
  );
};

HideClosedButton.propTypes = {
  toggleHiddenState: PropTypes.func.isRequired,
};
