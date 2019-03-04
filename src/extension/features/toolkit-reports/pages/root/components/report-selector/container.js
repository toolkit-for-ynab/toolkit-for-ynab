import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { ReportSelectorComponent } from './component';

function mapContextToProps(context) {
  return {
    activeReportKey: context.selectedReport.key,
    setActiveReportKey: context.setActiveReportKey,
  };
}

export const ReportSelector = withReportContext(mapContextToProps)(ReportSelectorComponent);
