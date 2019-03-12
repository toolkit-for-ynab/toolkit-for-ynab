import * as React from 'react';
import * as PropTypes from 'prop-types';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { SelectedReportContextPropType } from 'toolkit-reports/common/components/report-context/component';
import classnames from 'classnames';
import './styles.scss';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';

export class ReportFiltersComponent extends React.Component {
  static propTypes = {
    closeModal: PropTypes.func.isRequired,
    filters: PropTypes.shape(FiltersPropType),
    selectedReport: PropTypes.shape(SelectedReportContextPropType),
    setFilters: PropTypes.func.isRequired,
    showAccountFilterModal: PropTypes.func.isRequired,
    showCategoryFilterModal: PropTypes.func.isRequired,
    showDateSelectorModal: PropTypes.func.isRequired,
  };

  render() {
    const { disableCategoryFilter } = this.props.selectedReport.filterSettings;
    const { accountFilterIds, categoryFilterIds, dateFilter } = this.props.filters;
    const categoryButtonClasses = classnames('tk-button', 'tk-button--medium', 'tk-button--text', {
      'tk-button--disabled': disableCategoryFilter,
    });

    return (
      <div className="tk-flex tk-pd-05 tk-flex-shrink-none tk-border-b">
        <div className="tk-flex">
          <div className="tk-mg-r-05">
            <button onClick={this._showCategoryFilterModal} className={categoryButtonClasses}>
              {categoryFilterIds.size ? 'Some Categories' : 'All Categories'}
            </button>
          </div>
          <div className="tk-mg-r-05">
            <button
              onClick={this._showAccountFilterModal}
              className="tk-button tk-button--medium tk-button--text"
            >
              {accountFilterIds.size ? 'Some Accounts' : 'All Accounts'}
            </button>
          </div>
          <div className="tk-mg-r-05">
            <button
              onClick={this._showDateSelectorModal}
              className="tk-button tk-button--medium tk-button--text"
            >
              {`${localizedMonthAndYear(dateFilter.fromDate)} - ${localizedMonthAndYear(
                dateFilter.toDate
              )}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  _handleAccountsChanged = accountFilterIds => {
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

  _handleCategoriesChanged = categoryFilterIds => {
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

  _handleDatesChanged = dateFilter => {
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

  _applyFilters(newFilters) {
    this.props.setFilters({
      ...this.props.filters,
      ...newFilters,
    });
  }
}
