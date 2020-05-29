import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { componentAppend } from 'toolkit/extension/utils/react';

const ToggleButton = ({ longTitle, stateField }) => {
  const accountsController = controllerLookup('accounts');
  const [isToggled, setIsToggled] = React.useState(accountsController.get(`filters.${stateField}`));

  const observer = React.useCallback(filters => {
    setIsToggled(filters.get(stateField));
  });

  React.useEffect(() => {
    accountsController.get('filters').addObserver(stateField, observer);
    return () => accountsController.removeObserver(stateField, observer);
  }, []);

  const toggleSetting = () => {
    const filters = accountsController.get('filters');
    filters.set(`propertiesToSet.${stateField}`, !filters.get(stateField));
    filters.applyFilters();
  };

  return (
    <button className={`button ${!isToggled && 'button-disabled'}`} onClick={toggleSetting}>
      <i
        className={`flaticon solid ${
          stateField === 'reconciled' ? 'lock-1' : 'clock-1'
        } is-reconciled`}
      >
        {longTitle && (stateField === 'reconciled' ? ' Reconciled' : ' Scheduled')}
      </i>
    </button>
  );
};

ToggleButton.propTypes = {
  longTitle: PropTypes.bool.isRequired,
  stateField: PropTypes.string.isRequired,
};

export class ToggleTransactionFilters extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(this, 'accounts/account-header', 'didRender', this.injectButtons);
  }

  // Fix #1910
  injectCSS() {
    return require('./index.css');
  }

  injectButtons = element => {
    const toolbarRight = $('.accounts-toolbar-right', element);
    if ($('#tk-toggle-transaction-filters', toolbarRight).length) {
      return;
    }

    componentAppend(
      <span id="tk-toggle-transaction-filters">
        <ToggleButton stateField={'scheduled'} longTitle={this.settings.enabled === '2'} />
        <ToggleButton stateField={'reconciled'} longTitle={this.settings.enabled === '2'} />
      </span>,
      toolbarRight
    );
  };
}
