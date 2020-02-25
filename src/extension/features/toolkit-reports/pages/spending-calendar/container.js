import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { SpendingCalendarComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filteredTransactions: context.filteredTransactions,
  };
}

export const SpendingCalendar = withReportContext(mapReportContextToProps)(
  SpendingCalendarComponent
);
