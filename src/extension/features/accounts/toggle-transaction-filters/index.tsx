import React, { useState, useEffect } from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { componentBefore } from 'toolkit/extension/utils/react';
import { getAccountsService } from 'toolkit/extension/utils/ynab';

const ToggleButton = ({
  stateField,
  showLabel,
}: {
  stateField: 'reconciled' | 'scheduled';
  showLabel: boolean;
}) => {
  const accountsService = getAccountsService();
  const [isShown, setIsShown] = useState(accountsService?.filters?.[stateField]);

  useEffect(() => {
    accountsService?.addObserver(`filters.${stateField}`, () => {
      setIsShown(accountsService.filters?.[stateField]);
    });
  }, []);

  const toggleSetting = () => {
    if (!accountsService) return;
    const filters = accountsService.filters;
    filters.set(`propertiesToSet.${stateField}`, !filters?.[stateField]);
    filters.applyFilters();
  };

  return (
    <button className={`button ${!isShown && 'button-disabled '}`} onClick={toggleSetting}>
      <svg className="ynab-new-icon" width="16" height="16">
        <use href={stateField === 'reconciled' ? '#icon_sprite_lock' : '#icon_sprite_calendar'} />
      </svg>
      {showLabel && <span>{stateField === 'reconciled' ? 'Reconciled' : 'Scheduled'}</span>}
    </button>
  );
};

export class ToggleTransactionFilters extends Feature {
  observe(changedNodes: Set<string>) {
    if (changedNodes.has('accounts-toolbar-right')) {
      this.injectButtons($('.accounts-toolbar'));
    }
  }

  injectCSS() {
    return require('./styles.scss');
  }

  destroy() {
    $('#transaction-filters').remove();
  }

  injectButtons = ($element: JQuery<HTMLElement>) => {
    const toolbarRight = $('.accounts-toolbar-right', $element);
    if ($('#tk-toggle-transaction-filters', toolbarRight).length) {
      return;
    }

    const showLabel = this.settings.enabled === '2';

    componentBefore(
      <span id="tk-toggle-transaction-filters" className="tk-toggle-transaction-filters">
        <ToggleButton stateField="scheduled" showLabel={showLabel} />
        <ToggleButton stateField="reconciled" showLabel={showLabel} />
      </span>,
      $('.js-transaction-search', toolbarRight)[0]
    );
  };
}
