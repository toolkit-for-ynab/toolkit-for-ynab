import React, { useState, useEffect } from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { componentBefore } from 'toolkit/extension/utils/react';
import { getAccountsService } from 'toolkit/extension/utils/ynab';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

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
  containerClass = 'tk-toggle-transaction-filters';

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  injectCSS() {
    return require('./styles.scss');
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  destroy() {
    document.querySelector('.' + this.containerClass)?.remove();
  }

  invoke() {
    const showLabel = this.settings.enabled === '2';
    const toggleTransactionFiltersContainer = document.querySelector('.' + this.containerClass);

    if (!toggleTransactionFiltersContainer) {
      componentBefore(
        <span className={this.containerClass}>
          <ToggleButton stateField="scheduled" showLabel={showLabel} />
          <ToggleButton stateField="reconciled" showLabel={showLabel} />
        </span>,
        document.querySelector('.js-transaction-search')
      );
    }
  }
}
