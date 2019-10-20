import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { NetWorthComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filters: context.filters,
    allReportableTransactions: context.allReportableTransactions,
  };
}

export const NetWorth = withReportContext(mapReportContextToProps)(NetWorthComponent);
