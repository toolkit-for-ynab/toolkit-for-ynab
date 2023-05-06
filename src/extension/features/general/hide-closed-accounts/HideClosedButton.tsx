import * as React from 'react';
import { l10n, getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { serviceLookup } from 'toolkit/extension/utils/ember';

interface Props {
  toggleHiddenState: (state: boolean) => void;
}

export const HideClosedButton = ({ toggleHiddenState }: Props) => {
  const isHidden = getToolkitStorageKey('hide-closed', true);
  const label = isHidden ? l10n('toolkit.show', 'Show') : l10n('app.hide', 'Hide');

  const toggleHidden = () => {
    toggleHiddenState(!isHidden);
    serviceLookup<YNABModalService>('modal')?.closeModal?.();
  };

  return (
    <li onClick={toggleHidden} id="tk-hide-closed-accounts">
      <button>
        <i className="flaticon stroke no" />
        {` ${label}`} Closed Accounts
      </button>
    </li>
  );
};
