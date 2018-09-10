import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { NetWorthComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filters: context.filters,
    visibleTransactions: context.visibleTransactions
  };
}

export const NetWorth = withReportContext(mapReportContextToProps)(NetWorthComponent);

