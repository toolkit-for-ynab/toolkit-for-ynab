import { withToolContext } from 'toolkit-tools/common/components/tools-context';
import { SeriesLegendComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filters: context.filters,
  };
}

export const SeriesLegend = withToolContext(mapReportContextToProps)(SeriesLegendComponent);
