import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { componentBefore } from 'toolkit/extension/utils/react';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

const ToggleButton = ({ stateField }) => {
  const accountsController = controllerLookup('accounts');
  const [isShown, setIsShown] = React.useState(accountsController.get(`filters.${stateField}`));

  React.useEffect(() => {
    accountsController.addObserver(`filters.${stateField}`, () => {
      setIsShown(accountsController.get(`filters.${stateField}`));
    });
  }, []);

  const toggleSetting = () => {
    const filters = accountsController.get('filters');
    filters.set(`propertiesToSet.${stateField}`, !filters.get(stateField));
    filters.applyFilters();
  };

  return (
    <button className={`button ${!isShown && 'button-disabled '}`} onClick={toggleSetting}>
      <i
        className={`tk-toggle tk-toggle--${stateField} flaticon solid ${
          stateField === 'reconciled' ? 'lock-1' : 'calendar-1'
        } is-reconciled`}
      />
    </button>
  );
};

ToggleButton.propTypes = {
  stateField: PropTypes.string.isRequired,
};

export class ToggleTransactionFilters extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./no-labels.css');
    }

    if (this.settings.enabled === '2') {
      return require('./labels.css');
    }
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    this.onElement('.accounts-toolbar', this.injectButtons, {
      guard: '#tk-toggle-transaction-filters',
    });
  }

  observe() {
    this.onElement('.accounts-toolbar', this.injectButtons, {
      guard: '#tk-toggle-transaction-filters',
    });
  }

  destroy() {
    $('#tk-toggle-transaction-filters').remove();
  }

  injectButtons = (element) => {
    const toolbarRight = $('.accounts-toolbar-right', element);

    componentBefore(
      <span id="tk-toggle-transaction-filters" className="tk-toggle-transaction-filters">
        <ToggleButton stateField={'scheduled'} />
        <ToggleButton stateField={'reconciled'} />
      </span>,
      $('.js-transaction-search', toolbarRight)[0]
    );
  };
}
