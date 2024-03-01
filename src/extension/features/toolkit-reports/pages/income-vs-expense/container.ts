import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { IncomeVsExpenseComponent } from './component';

function mapReportContextToProps(context: ReportContextType) {
  return {
    filteredTransactions: context.filteredTransactions,
    filters: context.filters,
  };
}

export const IncomeVsExpense = withReportContext(mapReportContextToProps)(IncomeVsExpenseComponent);
