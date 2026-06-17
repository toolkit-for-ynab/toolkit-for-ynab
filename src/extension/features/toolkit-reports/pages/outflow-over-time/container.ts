import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { OutflowOverTimeComponent } from './OutflowOverTime';

const mapReportContextToProps = (context: ReportContextType) => {
  return {
    filters: context.filters,
    filteredTransactions: context.filteredTransactions,
  };
};
export const OutflowOverTime = withReportContext(mapReportContextToProps)(OutflowOverTimeComponent);
