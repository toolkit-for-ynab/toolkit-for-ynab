import * as React from 'react';
import { l10n, getToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { serviceLookup } from 'toolkit/extension/utils/ember';
import { YNABModalService } from 'toolkit/types/ynab/services/YNABModalService';

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
        <svg className="ynab-new-icon" width="16" height="16">
          <use href="#icon_sprite_lock"></use>
        </svg>
        {` ${label}`} Closed Accounts
      </button>
    </li>
  );
};
