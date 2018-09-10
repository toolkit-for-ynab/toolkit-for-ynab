import * as React from 'react';
import * as PropTypes from 'prop-types';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { getStoredAccountFilters } from './components/account-filter';
import { getStoredCategoryFilters } from './components/category-filter';
import { getStoredDateFilters } from './components/date-filter';
import { SelectedReportContextPropType } from 'toolkit-reports/common/components/report-context/component';
import classnames from 'classnames';
import './styles.scss';

export class ReportFiltersComponent extends React.Component {
  static propTypes = {
    closeModal: PropTypes.func.isRequired,
    selectedReport: PropTypes.shape(SelectedReportContextPropType),
    setFilters: PropTypes.func.isRequired,
    showAccountFilterModal: PropTypes.func.isRequired,
    showCategoryFilterModal: PropTypes.func.isRequired,
    showDateSelectorModal: PropTypes.func.isRequired
  }

  static getDerivedStateFromProps(props) {
    const activeReportKey = props.selectedReport.key;

    return {
      accountFilterIds: getStoredAccountFilters(activeReportKey).ignoredAccounts,
      categoryFilterIds: getStoredCategoryFilters(activeReportKey).ignoreSubCategories,
      dateFilter: getStoredDateFilters(activeReportKey)
    };
  }

  state = {}

  componentDidMount() {
    this._applyFilters();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedReport.key !== prevProps.selectedReport.key) {
      this._applyFilters();
    }
  }

  render() {
    const { disableCategoryFilter } = this.props.selectedReport.filterSettings;
    const categoryButtonClasses = classnames('tk-button', 'tk-button--medium', 'tk-button--text', {
      'tk-button--disabled': disableCategoryFilter
    });

    return (
      <div className="tk-flex tk-pd-05 tk-border-b">
        <div className="tk-flex">
          <div className="tk-mg-r-05">
            <button onClick={this._showCategoryFilterModal} className={categoryButtonClasses}>
              {this.state.categoryFilterIds.size ? 'Some Categories' : 'All Categories'}
            </button>
          </div>
          <div className="tk-mg-r-05">
            <button onClick={this._showAccountFilterModal} className="tk-button tk-button--medium tk-button--text">
              {this.state.accountFilterIds.size ? 'Some Accounts' : 'All Accounts'}
            </button>
          </div>
          <div className="tk-mg-r-05">
            <button onClick={this._showDateSelectorModal} className="tk-button tk-button--medium tk-button--text">
              {`${localizedMonthAndYear(this.state.dateFilter.fromDate)} - ${localizedMonthAndYear(this.state.dateFilter.toDate)}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  _handleAccountsChanged = (accountFilterIds) => {
    this.setState({ accountFilterIds }, () => {
      this.props.closeModal();
      this._applyFilters();
    });
  }

  _showAccountFilterModal = () => {
    this.props.showAccountFilterModal({
      accountFilterIds: this.state.accountFilterIds,
      onCancel: this.props.closeModal,
      onSave: this._handleAccountsChanged
    });
  }

  _handleCategoriesChanged = (categoryFilterIds) => {
    this.setState({ categoryFilterIds }, () => {
      this.props.closeModal();
      this._applyFilters();
    });
  }

  _showCategoryFilterModal = () => {
    if (this.props.selectedReport.filterSettings.disableCategoryFilter) {
      return;
    }

    this.props.showCategoryFilterModal({
      categoryFilterIds: this.state.categoryFilterIds,
      onCancel: this.props.closeModal,
      onSave: this._handleCategoriesChanged
    });
  }

  _handleDatesChanged = (dateFilter) => {
    this.setState({ dateFilter }, () => {
      this.props.closeModal();
      this._applyFilters();
    });
  }

  _showDateSelectorModal = () => {
    this.props.showDateSelectorModal({
      onCancel: this.props.closeModal,
      onSave: this._handleDatesChanged
    });
  }

  _applyFilters() {
    this.props.setFilters({
      accountFilterIds: this.state.accountFilterIds,
      categoryFilterIds: this.state.categoryFilterIds,
      dateFilter: this.state.dateFilter
    });
  }
}
