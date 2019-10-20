import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { IncomeBreakdownComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filteredTransactions: context.filteredTransactions,
    filters: context.filters,
  };
}

export const IncomeBreakdown = withReportContext(mapReportContextToProps)(IncomeBreakdownComponent);
