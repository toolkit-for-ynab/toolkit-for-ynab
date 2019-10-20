import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { SpendingByPayeeComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filteredTransactions: context.filteredTransactions,
  };
}

export const SpendingByPayee = withReportContext(mapReportContextToProps)(SpendingByPayeeComponent);
