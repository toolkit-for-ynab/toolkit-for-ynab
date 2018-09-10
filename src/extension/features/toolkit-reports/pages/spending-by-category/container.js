import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { SpendingByCategoryComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filteredTransactions: context.visibleTransactions
  };
}

export const SpendingByCategory = withReportContext(mapReportContextToProps)(SpendingByCategoryComponent);

