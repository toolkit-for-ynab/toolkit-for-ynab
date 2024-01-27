import * as React from 'react';
import { withModalContextProvider } from 'toolkit/extension/features/toolkit-reports/common/components/modal';
import {
  ReportContextType,
  withReportContext,
  withReportContextProvider,
} from 'toolkit-reports/common/components/report-context/component';
import { ReportFilters } from './components/report-filters';
import { ReportSelector } from './components/report-selector';
import './styles.scss';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

function mapContextToProps(context: ReportContextType) {
  return {
    selectedReport: context.selectedReport,
  };
}

export class RootComponent extends React.Component<
  { selectedReport: ReportContextType['selectedReport'] },
  { filteredTransactions: YNABTransaction[] }
> {
  state = {
    filteredTransactions: [],
  };

  render() {
    const { component: Report } = this.props.selectedReport;

    return (
      <div className="tk-reports-root tk-flex tk-flex-column tk-full-height">
        <ReportSelector />
        <ReportFilters />
        <Report />
      </div>
    );
  }
}

export const Root = withReportContextProvider(
  withModalContextProvider(withReportContext(mapContextToProps)(RootComponent))
);
