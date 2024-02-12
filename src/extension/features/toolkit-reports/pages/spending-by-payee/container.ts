import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { SpendingByPayeeComponent } from './component';

function mapReportContextToProps(context: ReportContextType) {
  return {
    filteredTransactions: context.filteredTransactions,
  };
}

export const SpendingByPayee = withReportContext(mapReportContextToProps)(SpendingByPayeeComponent);
