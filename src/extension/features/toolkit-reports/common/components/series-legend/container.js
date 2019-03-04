import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { SeriesLegendComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filters: context.filters,
  };
}

export const SeriesLegend = withReportContext(mapReportContextToProps)(SeriesLegendComponent);
