import * as React from 'react';
import { Collections } from 'toolkit/extension/utils/collections';
import { LabeledCheckbox } from 'toolkit/extension/features/toolkit-reports/common/components/labeled-checkbox';
import './styles.scss';
import { FiltersType } from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { YNABAccount } from 'toolkit/types/ynab/data/account';

export type AccountFilterProps = {
  accountFilterIds: FiltersType['accountFilterIds'];
  activeReportKey: string;
  includeClosedAccountType?: string;
  includeTrackingAccounts?: boolean;
  onCancel: VoidFunction;
  onSave: (accounts: FiltersType['accountFilterIds']) => void;
};

export class AccountFilterComponent extends React.Component<
  AccountFilterProps,
  { accountFilterIds: FiltersType['accountFilterIds'] }
> {
  _accountsCollection = Collections.accountsCollection;

  state = {
    accountFilterIds: this.props.accountFilterIds,
  };

  get onBudgetAccounts(): YNABAccount[] {
    const onBudgetAccounts = this._accountsCollection.getOnBudgetAccounts();
    return onBudgetAccounts ? onBudgetAccounts : [];
  }

  get offBudgetAccounts(): YNABAccount[] {
    if (!this.props.includeTrackingAccounts) {
      return [];
    }

    const offBudgetAccounts = this._accountsCollection.getTrackingAccounts();
    return offBudgetAccounts ? offBudgetAccounts : [];
  }

  get loanAccounts(): YNABAccount[] {
    const loanAccounts = this._accountsCollection.getLoanAccounts();
    return loanAccounts ? loanAccounts : [];
  }

  get closedAccounts(): YNABAccount[] {
    const closedAccounts = this._accountsCollection.getClosedAccounts();
    return (closedAccounts as YNABAccount[]).filter((account) => {
      return account.onBudget || this.props.includeTrackingAccounts;
    });
  }

  render() {
    const { accountFilterIds } = this.state;
    const onBudgetAccounts = this.onBudgetAccounts;
    const offBudgetAccounts = this.offBudgetAccounts;
    const loanAccounts = this.loanAccounts;
    const closedAccounts = this.closedAccounts;

    const onBudgetAccountsList: React.ReactNode[] = [];
    onBudgetAccounts.forEach(({ entityId, accountName }) => {
      onBudgetAccountsList.push(
        <div className="tk-mg-l-1" key={entityId}>
          <LabeledCheckbox
            id={entityId}
            checked={!accountFilterIds.has(entityId)}
            label={accountName}
            onChange={this._handleAccountToggled}
          />
        </div>
      );
    });

    const offBudgetAccountsList: React.ReactNode[] = [];
    offBudgetAccounts.forEach(({ entityId, accountName }) => {
      offBudgetAccountsList.push(
        <div className="tk-mg-l-1" key={entityId}>
          <LabeledCheckbox
            id={entityId}
            checked={!accountFilterIds.has(entityId)}
            label={accountName}
            onChange={this._handleAccountToggled}
          />
        </div>
      );
    });

    const loanAccountsList: React.ReactNode[] = [];
    loanAccounts.forEach(({ entityId, accountName }) => {
      loanAccountsList.push(
        <div className="tk-mg-l-1" key={entityId}>
          <LabeledCheckbox
            id={entityId}
            checked={!accountFilterIds.has(entityId)}
            label={accountName}
            onChange={this._handleAccountToggled}
          />
        </div>
      );
    });

    const closedAccountsList: React.ReactNode[] = [];
    closedAccounts.forEach(({ entityId, accountName }) => {
      closedAccountsList.push(
        <div className="tk-mg-l-1" key={entityId}>
          <LabeledCheckbox
            id={entityId}
            checked={!accountFilterIds.has(entityId)}
            label={accountName}
            onChange={this._handleAccountToggled}
          />
        </div>
      );
    });

    const areAllOnBudgetAccountsIgnored = onBudgetAccounts.every(({ entityId }) =>
      accountFilterIds.has(entityId)
    );
    const areAllOffBudgetAccountsIgnored = offBudgetAccounts.every(({ entityId }) =>
      accountFilterIds.has(entityId)
    );
    const areAllLoanAccountsIgnored = loanAccounts.every(({ entityId }) =>
      accountFilterIds.has(entityId)
    );
    const areAllClosedAccountsIgnored = closedAccounts.every(({ entityId }) =>
      accountFilterIds.has(entityId)
    );

    return (
      <div className="tk-account-filter tk-pd-1">
        <h3 className="tk-mg-0">Accounts</h3>
        <div className="tk-flex tk-mg-t-1 tk-mg-b-05 tk-pd-y-05 tk-border-y tk-modal-content__header-actions">
          <button
            className="tk-button tk-button--small tk-button--text"
            onClick={this._handleSelectAll}
          >
            Select All
          </button>
          <button
            className="tk-button tk-button--small tk-button--text tk-mg-l-05"
            onClick={this._handleSelectNone}
          >
            Select None
          </button>
        </div>
        <div className="tk-account-filter__account-list tk-pd-x-05">
          {onBudgetAccounts.length !== 0 && (
            <React.Fragment>
              <div className="tk-account-filter__labeled-checkbox--parent">
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
          {offBudgetAccounts.length !== 0 && (
            <React.Fragment>
              <div className="tk-account-filter__labeled-checkbox--parent">
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
          {loanAccounts.length !== 0 && (
            <React.Fragment>
              <div className="tk-account-filter__labeled-checkbox--parent">
                <LabeledCheckbox
                  id="loan-accounts"
                  checked={!areAllLoanAccountsIgnored}
                  label="Loan Accounts"
                  onChange={this._handleAllLoanToggled}
                />
              </div>
              {loanAccountsList}
            </React.Fragment>
          )}
          {closedAccounts.length !== 0 && (
            <React.Fragment>
              <div className="tk-account-filter__labeled-checkbox--parent">
                <LabeledCheckbox
                  id="closed-accounts"
                  checked={!areAllClosedAccountsIgnored}
                  label="Closed Accounts"
                  onChange={this._handleAllClosedToggled}
                />
              </div>
              {closedAccountsList}
            </React.Fragment>
          )}
        </div>
        <div className="tk-flex tk-justify-content-end tk-mg-t-1">
          <button className="tk-button tk-button--hollow" onClick={this.props.onCancel}>
            Cancel
          </button>
          <button className="tk-button tk-mg-l-05" onClick={this._save}>
            Done
          </button>
        </div>
      </div>
    );
  }

  _handleSelectAll = () => {
    const { accountFilterIds } = this.state;
    accountFilterIds.clear();
    this.setState({ accountFilterIds });
  };

  _handleSelectNone = () => {
    const { accountFilterIds } = this.state;
    this.onBudgetAccounts.forEach(function ({ entityId }) {
      accountFilterIds.add(entityId);
    });
    this.offBudgetAccounts.forEach(function ({ entityId }) {
      accountFilterIds.add(entityId);
    });
    this.loanAccounts.forEach(function ({ entityId }) {
      accountFilterIds.add(entityId);
    });
    this.closedAccounts.forEach(function ({ entityId }) {
      accountFilterIds.add(entityId);
    });

    this.setState({ accountFilterIds });
  };

  _handleAllOnBudgetToggled = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = currentTarget;
    const { accountFilterIds } = this.state;
    if (checked) {
      this.onBudgetAccounts.forEach(({ entityId }) => accountFilterIds.delete(entityId));
    } else {
      this.onBudgetAccounts.forEach(({ entityId }) => accountFilterIds.add(entityId));
    }

    this.setState({ accountFilterIds });
  };

  _handleAllOffBudgetToggled = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = currentTarget;
    const { accountFilterIds } = this.state;
    if (checked) {
      this.offBudgetAccounts.forEach(({ entityId }) => accountFilterIds.delete(entityId));
    } else {
      this.offBudgetAccounts.forEach(({ entityId }) => accountFilterIds.add(entityId));
    }

    this.setState({ accountFilterIds });
  };

  _handleAllLoanToggled = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = currentTarget;
    const { accountFilterIds } = this.state;
    if (checked) {
      this.loanAccounts.forEach(({ entityId }) => accountFilterIds.delete(entityId));
    } else {
      this.loanAccounts.forEach(({ entityId }) => accountFilterIds.add(entityId));
    }

    this.setState({ accountFilterIds });
  };

  _handleAllClosedToggled = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = currentTarget;
    const { accountFilterIds } = this.state;
    if (checked) {
      this.closedAccounts.forEach(({ entityId }) => accountFilterIds.delete(entityId));
    } else {
      this.closedAccounts.forEach(({ entityId }) => accountFilterIds.add(entityId));
    }

    this.setState({ accountFilterIds });
  };

  _handleAccountToggled = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = currentTarget;
    const { accountFilterIds } = this.state;
    if (checked) {
      accountFilterIds.delete(name);
    } else {
      accountFilterIds.add(name);
    }

    this.setState({ accountFilterIds });
  };

  _save = () => {
    this.props.onSave(this.state.accountFilterIds);
  };
}
