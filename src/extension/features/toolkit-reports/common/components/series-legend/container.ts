import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { SeriesLegendComponent } from './component';

function mapReportContextToProps(context: ReportContextType) {
  return {
    filters: context.filters,
  };
}

export const SeriesLegend = withReportContext(mapReportContextToProps)(SeriesLegendComponent);
