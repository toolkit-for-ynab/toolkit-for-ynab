import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { IncomeVsExpenseComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filteredTransactions: context.filteredTransactions,
    filters: context.filters,
  };
}

export const IncomeVsExpense = withReportContext(mapReportContextToProps)(IncomeVsExpenseComponent);
