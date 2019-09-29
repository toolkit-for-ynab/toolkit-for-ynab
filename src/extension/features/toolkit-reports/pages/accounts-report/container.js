import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { AccountsReportComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filters: context.filters,
    allReportableTransactions: context.allReportableTransactions,
  };
}

export const AccountsReport = withReportContext(mapReportContextToProps)(AccountsReportComponent);
