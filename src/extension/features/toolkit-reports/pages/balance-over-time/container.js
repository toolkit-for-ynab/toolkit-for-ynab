import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { BalanceOverTimeComponent } from './BalanceOverTime';

const mapReportContextToProps = context => {
  return {
    filters: context.filters,
    allReportableTransactions: context.allReportableTransactions,
  };
};
export const BalanceOverTime = withReportContext(mapReportContextToProps)(BalanceOverTimeComponent);
