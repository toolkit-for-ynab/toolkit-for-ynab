// import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
// import { formatCurrency } from 'toolkit/extension/utils/currency';
// import { localizedMonthAndYear, sortByGettableDate } from 'toolkit/extension/utils/date';
// import { l10n } from 'toolkit/extension/utils/toolkit';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';
import { DailyReport } from './components/daily-report';
import { MonthlyReport } from './components/monthly-report';

export class NetWorthComponent extends React.Component {
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    allReportableTransactions: PropTypes.array.isRequired,
  };

  state = {
    showDaily: false,
  };

  render() {
    const { showDaily } = this.state;
    const { allReportableTransactions, filters } = this.props;
    return (
      <div className="tk-flex tk-flex-column tk-flex-grow">
        <div className="tk-flex tk-pd-05 tk-border-b">
          <div className="tk-income-breakdown__filter">
            <LabeledCheckbox
              id="tk-income-breakdown-hide-income-selector"
              checked={showDaily}
              label="Show Daily Net Worth"
              onChange={this.toggleDaily}
            />
          </div>
        </div>
        {showDaily ? (
          <DailyReport allReportableTransactions={allReportableTransactions} filters={filters} />
        ) : (
          <MonthlyReport allReportableTransactions={allReportableTransactions} filters={filters} />
        )}
      </div>
    );
  }

  toggleDaily = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ showDaily: checked });
    this._calculateData();
  };
}
