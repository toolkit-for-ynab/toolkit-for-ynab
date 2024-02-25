import * as React from 'react';
import * as PropTypes from 'prop-types';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import {
  FiltersType,
  SelectedReportContextPropType,
} from 'toolkit-reports/common/components/report-context/component';
import classnames from 'classnames';
import './styles.scss';
import { AccountFilter } from './components/account-filter';
import { CategoryFilter } from './components/category-filter';
import { DateFilter } from './components/date-filter';

export type ReportFiltersProps = {
  closeModal: VoidFunction;
  filters: FiltersType;
  selectedReport: SelectedReportContextPropType;
  setFilters: (filter: FiltersType) => void;
  showAccountFilterModal: (props: React.ComponentProps<typeof AccountFilter>) => void;
  showCategoryFilterModal: (props: React.ComponentProps<typeof CategoryFilter>) => void;
  showDateSelectorModal: (props: React.ComponentProps<typeof DateFilter>) => void;
};

export class ReportFiltersComponent extends React.Component<ReportFiltersProps> {
  render() {
    const { disableCategoryFilter } = this.props.selectedReport.filterSettings;
    const ExtraComponent = this.props.selectedReport.filtersExtraComponent;
    const { accountFilterIds, categoryFilterIds, dateFilter } = this.props.filters;
    const categoryButtonClasses = classnames(
      'tk-button',
      'tk-button--hollow',
      'tk-button--medium',
      'tk-button--text',
      {
        'tk-button--disabled': disableCategoryFilter,
      }
    );

    return (
      <div className="tk-flex tk-pd-05 tk-flex-shrink-none tk-border-y">
        <div className="tk-flex">
          <div className="tk-mg-r-05">
            <button onClick={this._showCategoryFilterModal} className={categoryButtonClasses}>
              {categoryFilterIds.size ? 'Some Categories' : 'All Categories'}
            </button>
          </div>
          <div className="tk-mg-r-05">
            <button
              onClick={this._showAccountFilterModal}
              className="tk-button tk-button--hollow tk-button--medium tk-button--text"
            >
              {accountFilterIds.size ? 'Some Accounts' : 'All Accounts'}
            </button>
          </div>
          <div className="tk-mg-r-05">
            <button
              onClick={this._showDateSelectorModal}
              className="tk-button tk-button--hollow tk-button--medium tk-button--text"
            >
              {`${localizedMonthAndYear(dateFilter.fromDate)} - ${localizedMonthAndYear(
                dateFilter.toDate
              )}`}
            </button>
          </div>
        </div>
        {!!ExtraComponent && <ExtraComponent />}
      </div>
    );
  }

  _handleAccountsChanged = (accountFilterIds: FiltersType['accountFilterIds']) => {
    this.props.closeModal();
    this._applyFilters({ accountFilterIds });
  };

  _showAccountFilterModal = () => {
    this.props.showAccountFilterModal({
      accountFilterIds: this.props.filters.accountFilterIds,
      includeTrackingAccounts: this.props.selectedReport.filterSettings.includeTrackingAccounts,
      onCancel: this.props.closeModal,
      onSave: this._handleAccountsChanged,
    });
  };

  _handleCategoriesChanged = (categoryFilterIds: FiltersType['categoryFilterIds']) => {
    this.props.closeModal();
    this._applyFilters({ categoryFilterIds });
  };

  _showCategoryFilterModal = () => {
    if (this.props.selectedReport.filterSettings.disableCategoryFilter) {
      return;
    }

    this.props.showCategoryFilterModal({
      categoryFilterIds: this.props.filters.categoryFilterIds,
      onCancel: this.props.closeModal,
      onSave: this._handleCategoriesChanged,
    });
  };

  _handleDatesChanged = (dateFilter: FiltersType['dateFilter']) => {
    this.props.closeModal();
    this._applyFilters({ dateFilter });
  };

  _showDateSelectorModal = () => {
    this.props.showDateSelectorModal({
      dateFilter: this.props.filters.dateFilter,
      onCancel: this.props.closeModal,
      onSave: this._handleDatesChanged,
    });
  };

  _applyFilters(newFilters: Partial<FiltersType>) {
    this.props.setFilters({
      ...this.props.filters,
      ...newFilters,
    });
  }
}
