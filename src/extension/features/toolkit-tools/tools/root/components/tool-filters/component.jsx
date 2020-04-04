/**
 * This file contains the code to set up the "filter row".
 */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { localizedMonthAndYear } from '$toolkit/extension/utils/date';
import { SelectedToolContextPropType } from '$tools/common/components/tool-context/component';
import classnames from 'classnames';
import './styles.scss';
import { FiltersPropType } from '$tools/common/components/tool-context/component';

export class ToolFiltersComponent extends React.Component {
  static propTypes = {
    closeModal: PropTypes.func.isRequired,
    filters: PropTypes.shape(FiltersPropType),
    selectedTool: PropTypes.shape(SelectedToolContextPropType),
    setFilters: PropTypes.func.isRequired,
    showAccountFilterModal: PropTypes.func.isRequired,
    showCategoryFilterModal: PropTypes.func.isRequired,
    showDateSelectorModal: PropTypes.func.isRequired,
  };

  render() {
    const { disableCategoryFilter } = this.props.selectedTool.filterSettings;
    const { accountFilterIds, categoryFilterIds, dateFilter } = this.props.filters;
    const filterButtonClasses = classnames('tk-button', 'tk-button--medium', 'tk-button--text', {
      'tk-button--disabled': disableCategoryFilter,
    });

    // eslint-disable-next-line prettier/prettier, no-unused-vars
    let valDate = dateFilter.size
      ? 'Date Filter Not Allowed'
      : `${localizedMonthAndYear(dateFilter.fromDate)} - 
         ${localizedMonthAndYear(dateFilter.toDate)}`;

    return (
      <div className="tk-flex tk-pd-05 tk-flex-shrink-none tk-border-b">
        <div className="tk-flex">
          <div className="tk-mg-r-05">
            <button onClick={this._showCategoryFilterModal} className={filterButtonClasses}>
              {categoryFilterIds.size ? 'Some Categories' : 'All Categories'}
            </button>
          </div>
          <div className="tk-mg-r-05">
            <button onClick={this._showAccountFilterModal} className={filterButtonClasses}>
              {accountFilterIds.size ? 'Some Accounts' : 'All Accounts'}
            </button>
          </div>
          <div className="tk-mg-r-05">
            <button onClick={this._showDateSelectorModal} className={filterButtonClasses}>
              {valDate.length ? valDate : 'All Dates'}
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
      includeTrackingAccounts: this.props.selectedTool.filterSettings.includeTrackingAccounts,
      onCancel: this.props.closeModal,
      onSave: this._handleAccountsChanged,
    });
  };

  _handleCategoriesChanged = categoryFilterIds => {
    this.props.closeModal();
    this._applyFilters({ categoryFilterIds });
  };

  _showCategoryFilterModal = () => {
    if (this.props.selectedTool.filterSettings.disableCategoryFilter) {
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
