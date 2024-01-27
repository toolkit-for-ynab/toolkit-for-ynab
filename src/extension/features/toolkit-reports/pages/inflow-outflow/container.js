import { withReportContext } from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { InflowOutflowComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filteredTransactions: context.filteredTransactions,
    filters: context.filters,
  };
}

export const InflowOutflow = withReportContext(mapReportContextToProps)(InflowOutflowComponent);
