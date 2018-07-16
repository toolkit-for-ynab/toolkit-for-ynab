import * as React from 'react';
import { ReportKeys, REPORT_TYPES } from 'toolkit/extension/features/toolkit-reports/common/constants/report-types';
import { IncomeVsExpense } from 'toolkit/extension/features/toolkit-reports/pages/income-vs-expense';
import { NetWorth } from 'toolkit/extension/features/toolkit-reports/pages/net-worth';
import { SpendingByPayee } from 'toolkit/extension/features/toolkit-reports/pages/spending-by-payee';
import { SpendingByCategory } from 'toolkit/extension/features/toolkit-reports/pages/spending-by-category';
import { ReportFilters } from './components/report-filters';
import { ReportSelector } from './components/report-selector';
import './styles.scss';

const REPORT_COMPONENTS = [{
  component: NetWorth,
  key: ReportKeys.NetWorth
}, {
  component: SpendingByPayee,
  key: ReportKeys.SpendingByPayee
}, {
  component: SpendingByCategory,
  key: ReportKeys.SpendingByCategory
}, {
  component: IncomeVsExpense,
  key: ReportKeys.IncomeVsExpense
}];

export class Root extends React.Component {
  state = {
    activeReportKey: REPORT_TYPES[0].key,
    filteredTransactions: []
  }

  render() {
    const ReportComponent = REPORT_COMPONENTS.find(({ key }) => key === this.state.activeReportKey).component;

    return (
      <div className="tk-reports-root">
        <ReportSelector activeReportKey={this.state.activeReportKey} onSelect={this.handleReportSelected} />
        <ReportFilters onChanged={this.handleFiltersChanged} />
        <ReportComponent transactions={this.state.filteredTransactions} />
      </div>
    );
  }

  handleReportSelected = (selected) => {
    this.setState({ activeReportKey: selected });
    console.log('report selected: ', selected);
  }

  handleFiltersChanged = (filteredTransactions) => {
    // filter the transactions as according to new filters and setState({ transactions });
    console.log(filteredTransactions);
    this.setState({ filteredTransactions });
  }
}
