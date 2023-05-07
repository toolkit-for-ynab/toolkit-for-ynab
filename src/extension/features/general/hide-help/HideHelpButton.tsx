import * as React from 'react';
import { serviceLookup } from 'toolkit/extension/utils/ember';
import { l10n, getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { YNABModalService } from 'toolkit/types/ynab/services/YNABModalService';

interface Props {
  toggleHiddenState: (state: boolean) => void;
}

export const HideHelpButton = ({ toggleHiddenState }: Props) => {
  const isHidden = getToolkitStorageKey('hide-help', true);
  const label = isHidden ? l10n('toolkit.show', 'Show') : l10n('app.hide', 'Hide');

  const toggleHidden = () => {
    toggleHiddenState(!isHidden);
    serviceLookup<YNABModalService>('modal')?.closeModal?.();
  };

  return (
    <li onClick={toggleHidden} id="tk-hide-help">
      <button>
        <i className="flaticon stroke help-2" />
        {` ${label}`} Help Button
      </button>
    </li>
  );
};
