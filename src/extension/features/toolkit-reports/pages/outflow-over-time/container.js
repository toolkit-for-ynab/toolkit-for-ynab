import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { OutflowOverTimeComponent } from './OutflowOverTime';

const mapReportContextToProps = (context) => {
  return {
    filters: context.filters,
    allReportableTransactions: context.allReportableTransactions,
  };
};
export const OutflowOverTime = withReportContext(mapReportContextToProps)(OutflowOverTimeComponent);
