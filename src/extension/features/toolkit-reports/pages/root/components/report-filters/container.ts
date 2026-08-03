import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { ReportFiltersComponent } from './component';

function mapReportContextToProps(context: ReportContextType) {
  return {
    filters: context.filters,
    selectedReport: context.selectedReport,
    setFilters: context.setFilters,
  };
}

export const ReportFilters = withReportContext(mapReportContextToProps)(ReportFiltersComponent);
