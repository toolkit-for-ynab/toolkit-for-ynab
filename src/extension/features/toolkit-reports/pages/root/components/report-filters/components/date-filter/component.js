import * as React from 'react';
import * as PropTypes from 'prop-types';
import { getFirstMonthOfBudget, getToday } from 'toolkit/extension/utils/date';
import { getToolkitStorageKey, l10nMonth, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import './styles.scss';

export function getStoredDateFilters(reportKey) {
  const stored = getToolkitStorageKey(`date-filters-${reportKey}`, { fromDate: null, toDate: null });

  let fromDate = getFirstMonthOfBudget();
  let toDate = getToday();
  try {
    fromDate = ynab.utilities.DateWithoutTime.createFromISOString(stored.fromDate);
    toDate = ynab.utilities.DateWithoutTime.createFromISOString(stored.toDate);
  } catch (e) { /* defaults */ }

  return { fromDate, toDate };
}

function storeDateFilters(reportKey, filters) {
  setToolkitStorageKey(`date-filters-${reportKey}`, {
    fromDate: filters.fromDate ? filters.fromDate.toISOString() : null,
    toDate: filters.toDate ? filters.toDate.toISOString() : null
  });
}

const Options = {
  ThisMonth: 'This Month',
  LastMonth: 'Last Month',
  LastThreeMonths: 'Last Three Months',
  ThisYear: 'This Year',
  LastYear: 'Last Year',
  AllDates: 'All Dates'
};

export class DateFilterComponent extends React.Component {
  static propTypes = {
    activeReportKey: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  get firstMonthOfBudget() {
    return getFirstMonthOfBudget();
  }

  get startOfThisMonth() {
    return getToday().startOfMonth();
  }

  constructor(props) {
    super(props);

    const storedFilters = getStoredDateFilters(this.props.activeReportKey);
    this.state = {
      selectedFromMonth: storedFilters.fromDate.getMonth(),
      selectedFromYear: storedFilters.fromDate.getYear(),
      selectedToMonth: storedFilters.toDate.getMonth(),
      selectedToYear: storedFilters.toDate.getYear()
    };
  }

  render() {
    return (
      <div className="tk-pd-1">
        <h3 className="tk-mg-0">Date Range</h3>
        <div className="tk-flex tk-mg-t-1 tk-mg-b-05 tk-pd-y-05 tk-border-y tk-modal-content__header-actions">
          <button name={Options.ThisMonth} className="tk-button tk-button--small tk-button--text" onClick={this._handleOptionSelected}>{Options.ThisMonth}</button>
          <button name={Options.LastMonth} className="tk-button tk-button--small tk-button--text tk-mg-l-05" onClick={this._handleOptionSelected}>{Options.LastMonth}</button>
          <button name={Options.LastThreeMonths} className="tk-button tk-button--small tk-button--text tk-mg-l-05" onClick={this._handleOptionSelected}>{Options.LastThreeMonths}</button>
          <button name={Options.ThisYear} className="tk-button tk-button--small tk-button--text tk-mg-l-05" onClick={this._handleOptionSelected}>{Options.ThisYear}</button>
          <button name={Options.LastYear} className="tk-button tk-button--small tk-button--text tk-mg-l-05" onClick={this._handleOptionSelected}>{Options.LastYear}</button>
          <button name={Options.AllDates} className="tk-button tk-button--small tk-button--text tk-mg-l-05" onClick={this._handleOptionSelected}>{Options.AllDates}</button>
        </div>
        <div className="tk-flex tk-justify-content-around">
          <div className="tk-flex tk-align-items-center">
            <div className="tk-mg-r-05">From:</div>
            <select className="tk-date-filter__select" value={this.state.selectedFromMonth} onChange={this._handleFromMonthSelected}>
              {this._renderEligibleMonths(this.state.selectedFromYear)}
            </select>
            <select className="tk-date-filter__select tk-mg-l-05" value={this.state.selectedFromYear} onChange={this._handleFromYearSelected}>
              {this._renderEligibleYears()}
            </select>
          </div>
          <div className="tk-flex tk-align-items-center">
            <div className="tk-mg-r-05">To:</div>
            <select className="tk-date-filter__select" value={this.state.selectedToMonth} onChange={this._handleToMonthSelected}>
              {this._renderEligibleMonths(this.state.selectedToYear)}
            </select>
            <select className="tk-date-filter__select tk-mg-l-05" value={this.state.selectedToYear} onChange={this._handleToYearSelected}>
              {this._renderEligibleYears()}
            </select>
          </div>
        </div>
        <div className="tk-flex tk-justify-content-center tk-mg-t-1">
          <button className="tk-button tk-button--hollow" onClick={this.props.onCancel}>Cancel</button>
          <button className="tk-button tk-mg-l-05" onClick={this._save}>Done</button>
        </div>
      </div>
    );
  }

  _getEligibleMonths(selectedYear) {
    const today = getToday();
    const date = new ynab.utilities.DateWithoutTime();
    date.startOfYear().setYear(selectedYear);

    const options = [];
    // HTML values are converted to string and that's what's stored in state so
    // we need to convert `.getYear()` into a string.
    while (date.getYear().toString() === selectedYear.toString()) {
      options.push({
        disabled: date.isAfter(today) || date.isBefore(this.firstMonthOfBudget),
        month: date.getMonth()
      });

      date.addMonths(1);
    }

    return options;
  }

  _renderEligibleMonths(selectedYear) {
    const eligibleMonths = this._getEligibleMonths(selectedYear);
    return eligibleMonths.map(({ disabled, month }) => ((
      <option key={month} disabled={disabled} value={month}>{l10nMonth(month)}</option>
    )));
  }

  _renderEligibleYears() {
    const today = getToday();
    const date = getFirstMonthOfBudget();

    const options = [];
    while (date.getYear() <= today.getYear()) {
      options.push((
        <option key={date.getYear()} value={date.getYear()}>{date.getYear()}</option>
      ));

      date.addYears(1);
    }

    return options;
  }

  _handleFromMonthSelected = ({ currentTarget }) => {
    this.setState({ selectedFromMonth: currentTarget.value });
  }

  _handleFromYearSelected = ({ currentTarget }) => {
    const { selectedFromMonth } = this.state;
    const toDate = new ynab.utilities.DateWithoutTime();
    toDate.setMonth(selectedFromMonth).setYear(currentTarget.value).startOfMonth();

    let selectedMonth = selectedFromMonth;
    if (toDate.isBefore(this.firstMonthOfBudget)) {
      selectedMonth = this.firstMonthOfBudget.getMonth();
    } else if (toDate.isAfter(this.startOfThisMonth)) {
      selectedMonth = this.startOfThisMonth.getMonth();
    }

    this.setState({ selectedFromMonth: selectedMonth, selectedFromYear: currentTarget.value });
  }

  _handleToMonthSelected = ({ currentTarget }) => {
    this.setState({ selectedToMonth: currentTarget.value });
  }

  _handleToYearSelected = ({ currentTarget }) => {
    const { selectedToMonth } = this.state;
    const toDate = new ynab.utilities.DateWithoutTime();
    toDate.setMonth(selectedToMonth).setYear(currentTarget.value).startOfMonth();

    let selectedMonth = selectedToMonth;
    if (toDate.isBefore(this.firstMonthOfBudget)) {
      selectedMonth = this.firstMonthOfBudget.getMonth();
    } else if (toDate.isAfter(this.startOfThisMonth)) {
      selectedMonth = this.startOfThisMonth.getMonth();
    }

    this.setState({ selectedToMonth: selectedMonth, selectedToYear: currentTarget.value });
  }

  _getEligibleMonth(selectedMonth, selectedYear) {
    const date = new ynab.utilities.DateWithoutTime();
    date.setMonth(selectedMonth).setYear(selectedYear).startOfMonth();

    if (date.isBefore(this.firstMonthOfBudget)) {
      return this.firstMonthOfBudget;
    } else if (date.isAfter(this.startOfThisMonth)) {
      return this.startOfThisMonth;
    }

    return date;
  }

  _getSelectedFromDates(fromDate, toDate) {
    const eligibleFromDate = this._getEligibleMonth(fromDate.getMonth(), fromDate.getYear());
    const eligibleToDate = this._getEligibleMonth(toDate.getMonth(), toDate.getYear());

    return {
      selectedFromMonth: eligibleFromDate.getMonth(),
      selectedFromYear: eligibleFromDate.getYear(),
      selectedToMonth: eligibleToDate.getMonth(),
      selectedToYear: eligibleToDate.getYear()
    };
  }

  _handleOptionSelected = ({ currentTarget }) => {
    const today = getToday();

    switch (currentTarget.name) {
      case Options.ThisMonth:
        this.setState(this._getSelectedFromDates(today, today));
        break;
      case Options.LastMonth:
        const lastMonth = today.clone().subtractMonths(1);
        this.setState(this._getSelectedFromDates(lastMonth, lastMonth));
        break;
      case Options.LastThreeMonths:
        this.setState(this._getSelectedFromDates(today.clone().subtractMonths(3), today));
        break;
      case Options.ThisYear:
        this.setState(this._getSelectedFromDates(today.clone().startOfYear(), today));
        break;
      case Options.LastYear:
        const startOfLastYear = today.clone().subtractYears(1).startOfYear();
        const endOfLastYear = today.clone().subtractYears(1).endOfYear();
        this.setState(this._getSelectedFromDates(startOfLastYear, endOfLastYear));
        break;
      case Options.AllDates:
        this.setState(this._getSelectedFromDates(this.firstMonthOfBudget, today));
        break;
    }
  }

  _save = () => {
    const { selectedFromMonth, selectedFromYear, selectedToMonth, selectedToYear } = this.state;
    const fromDate = new ynab.utilities.DateWithoutTime();
    fromDate.setYear(selectedFromYear);
    fromDate.setMonth(selectedFromMonth);
    fromDate.startOfMonth();

    const toDate = new ynab.utilities.DateWithoutTime();
    toDate.setYear(selectedToYear);
    toDate.setMonth(selectedToMonth);
    toDate.endOfMonth();

    const dateFilters = { toDate, fromDate };
    storeDateFilters(this.props.activeReportKey, dateFilters);
    this.props.onSave(dateFilters);
  }
}
