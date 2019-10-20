import * as React from 'react';
import * as PropTypes from 'prop-types';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n, getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export const HideHelpButton = ({ toggleHiddenState }) => {
  const isHidden = getToolkitStorageKey('hide-help', true);
  const label = isHidden ? l10n('app.show', 'Show') : l10n('app.hide', 'Hide');

  const toggleHidden = () => {
    toggleHiddenState(!isHidden);
    controllerLookup('application').send('closeModal');
  };

  return (
    <li onClick={toggleHidden}>
      <button>
        <i className="flaticon stroke help-2" />
        {` ${label}`} Help Button
      </button>
    </li>
  );
};

HideHelpButton.propTypes = {
  toggleHiddenState: PropTypes.func.isRequired,
};
