import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { SpendingByCategoryComponent } from './component';

function mapReportContextToProps(context: ReportContextType) {
  return {
    filteredTransactions: context.filteredTransactions,
  };
}

export const SpendingByCategory = withReportContext(mapReportContextToProps)(
  SpendingByCategoryComponent
);
