import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { DateFilterComponent } from './component';

function mapContextToProps(context: ReportContextType) {
  return {
    activeReportKey: context.selectedReport!.key,
  };
}

export const DateFilter = withReportContext(mapContextToProps)(DateFilterComponent);
