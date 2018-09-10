import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';
import './styles.scss';

export function getStoredAccountFilters(reportKey) {
  const stored = getToolkitStorageKey(`account-filters-${reportKey}`, {
    ignoredAccounts: []
  });

  return {
    ignoredAccounts: new Set(stored.ignoredAccounts)
  };
}

function storeAccountFilters(reportKey, filters) {
  setToolkitStorageKey(`account-filters-${reportKey}`, {
    ignoredAccounts: Array.from(filters.ignoredAccounts)
  });
}

export class AccountFilterComponent extends React.Component {
  static propTypes = {
    activeReportKey: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  state = getStoredAccountFilters(this.props.activeReportKey)

  get onBudgetAccounts() {
    return Collections.accountsCollection.getOnBudgetAccounts().toArray();
  }

  get offBudgetAccounts() {
    return Collections.accountsCollection.getOffBudgetAccounts().toArray();
  }

  render() {
    const { ignoredAccounts } = this.state;
    const onBudgetAccounts = this.onBudgetAccounts;
    const offBudgetAccounts = this.offBudgetAccounts;

    const onBudgetAccountsList = [];
    onBudgetAccounts.forEach(({ entityId, accountName }) => {
      onBudgetAccountsList.push((
        <div className="tk-mg-l-1" key={entityId}>
          <LabeledCheckbox
            id={entityId}
            checked={!ignoredAccounts.has(entityId)}
            label={accountName}
            onChange={this._handleAccountToggled}
          />
        </div>
      ));
    });

    const offBudgetAccountsList = [];
    offBudgetAccounts.forEach(({ entityId, accountName }) => {
      offBudgetAccountsList.push((
        <div className="tk-mg-l-1" key={entityId}>
          <LabeledCheckbox
            id={entityId}
            checked={!ignoredAccounts.has(entityId)}
            label={accountName}
            onChange={this._handleAccountToggled}
          />
        </div>
      ));
    });

    const areAllOnBudgetAccountsIgnored = onBudgetAccounts.every(({ entityId }) => ignoredAccounts.has(entityId));
    const areAllOffBudgetAccountsIgnored = offBudgetAccounts.every(({ entityId }) => ignoredAccounts.has(entityId));

    return (
      <div className="tk-account-filter tk-pd-1">
        <h3 className="tk-mg-0">Accounts</h3>
        <div className="tk-flex tk-mg-t-1 tk-mg-b-05 tk-pd-y-05 tk-border-y tk-modal-content__header-actions">
          <button className="tk-button tk-button--small tk-button--text" onClick={this._handleSelectAll}>Select All</button>
          <button className="tk-button tk-button--small tk-button--text tk-mg-l-05" onClick={this._handleSelectNone}>Select None</button>
        </div>
        <div className="tk-account-filter__account-list tk-pd-x-05">
          {onBudgetAccounts.length && (
            <React.Fragment>
              <div>
                <LabeledCheckbox
                  id="on-budget-accounts"
                  checked={!areAllOnBudgetAccountsIgnored}
                  label="On Budget Accounts"
                  onChange={this._handleAllOnBudgetToggled}
                />
              </div>
              {onBudgetAccountsList}
            </React.Fragment>
          )}
          {offBudgetAccounts.length && (
            <React.Fragment>
              <div>
                <LabeledCheckbox
                  id="off-budget-accounts"
                  checked={!areAllOffBudgetAccountsIgnored}
                  label="Off Budget Accounts"
                  onChange={this._handleAllOffBudgetToggled}
                />
              </div>
              {offBudgetAccountsList}
            </React.Fragment>
          )}
        </div>
        <div className="tk-flex tk-justify-content-center tk-mg-t-1">
          <button className="tk-button tk-button--hollow" onClick={this.props.onCancel}>Cancel</button>
          <button className="tk-button tk-mg-l-05" onClick={this._save}>Done</button>
        </div>
      </div>
    );
  }

  _handleSelectAll = () => {
    const { ignoredAccounts } = this.state;
    ignoredAccounts.clear();
    this.setState({ ignoredAccounts });
  }

  _handleSelectNone = () => {
    const { ignoredAccounts } = this.state;
    this.onBudgetAccounts.forEach(function ({ entityId }) { ignoredAccounts.add(entityId); });
    this.offBudgetAccounts.forEach(function ({ entityId }) { ignoredAccounts.add(entityId); });

    this.setState({ ignoredAccounts });
  }

  _handleAllOnBudgetToggled = ({ currentTarget }) => {
    const { checked } = currentTarget;
    const { ignoredAccounts } = this.state;
    if (checked) {
      this.onBudgetAccounts.forEach(({ entityId }) => ignoredAccounts.delete(entityId));
    } else {
      this.onBudgetAccounts.forEach(({ entityId }) => ignoredAccounts.add(entityId));
    }

    this.setState({ ignoredAccounts });
  }

  _handleAllOffBudgetToggled = ({ currentTarget }) => {
    const { checked } = currentTarget;
    const { ignoredAccounts } = this.state;
    if (checked) {
      this.offBudgetAccounts.forEach(({ entityId }) => ignoredAccounts.delete(entityId));
    } else {
      this.offBudgetAccounts.forEach(({ entityId }) => ignoredAccounts.add(entityId));
    }

    this.setState({ ignoredAccounts });
  }

  _handleAccountToggled = ({ currentTarget }) => {
    const { checked, name } = currentTarget;
    const { ignoredAccounts } = this.state;
    if (checked) {
      ignoredAccounts.delete(name);
    } else {
      ignoredAccounts.add(name);
    }

    this.setState({ ignoredAccounts });
  }

  _save = () => {
    storeAccountFilters(this.props.activeReportKey, this.state);
    this.props.onSave(this.state.ignoredAccounts);
  }
}
