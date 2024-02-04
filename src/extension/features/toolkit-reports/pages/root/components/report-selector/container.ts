import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { ReportSelectorComponent } from './component';

function mapContextToProps(context: ReportContextType) {
  return {
    activeReportKey: context.selectedReport!.key,
    setActiveReportKey: context.setActiveReportKey,
  };
}

export const ReportSelector = withReportContext(mapContextToProps)(ReportSelectorComponent);
