import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Feature } from 'toolkit/extension/features/feature';
import { componentBefore } from 'toolkit/extension/utils/react';
import { getAccountsService } from 'toolkit/extension/utils/ynab';

const ToggleButton = ({ stateField }) => {
  const accountsService = getAccountsService();
  const [isShown, setIsShown] = React.useState(accountsService.filters?.[stateField]);

  React.useEffect(() => {
    accountsService.addObserver(`filters.${stateField}`, () => {
      setIsShown(accountsService.filters?.[stateField]);
    });
  }, []);

  const toggleSetting = () => {
    const filters = accountsService.filters;
    filters.set(`propertiesToSet.${stateField}`, !filters?.[stateField]);
    filters.applyFilters();
  };

  return (
    <button className={`button ${!isShown && 'button-disabled '}`} onClick={toggleSetting}>
      <svg className="ynab-new-icon" width="16" height="16">
        <use href={stateField === 'reconciled' ? '#icon_sprite_lock' : '#icon_sprite_calendar'} />
      </svg>
    </button>
  );
};

ToggleButton.propTypes = {
  stateField: PropTypes.string.isRequired,
};

export class ToggleTransactionFilters extends Feature {
  observe(changedNodes) {
    if (changedNodes.has('accounts-toolbar-right')) {
      this.injectButtons($('.accounts-toolbar'));
    }
  }

  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./no-labels.css');
    }

    if (this.settings.enabled === '2') {
      return require('./labels.css');
    }
  }

  destroy() {
    $('#tk-toggle-transaction-filters').remove();
  }

  injectButtons = (element) => {
    const toolbarRight = $('.accounts-toolbar-right', element);
    if ($('#tk-toggle-transaction-filters', toolbarRight).length) {
      return;
    }

    componentBefore(
      <span id="tk-toggle-transaction-filters" className="tk-toggle-transaction-filters">
        <ToggleButton stateField={'scheduled'} />
        <ToggleButton stateField={'reconciled'} />
      </span>,
      $('.js-transaction-search', toolbarRight)[0]
    );
  };
}
