import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { DateFilterComponent } from './component';

function mapContextToProps(context) {
  return {
    activeReportKey: context.selectedReport.key,
  };
}

export const DateFilter = withReportContext(mapContextToProps)(DateFilterComponent);
