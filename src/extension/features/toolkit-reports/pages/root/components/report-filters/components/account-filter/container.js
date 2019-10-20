import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { AccountFilterComponent } from './component';

function mapContextToProps(context) {
  return {
    activeReportKey: context.selectedReport.key,
  };
}

export const AccountFilter = withReportContext(mapContextToProps)(AccountFilterComponent);
