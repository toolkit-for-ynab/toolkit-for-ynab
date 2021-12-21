import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { ForecastComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filters: context.filters,
    allReportableTransactions: context.allReportableTransactions,
  };
}

export const Forecast = withReportContext(mapReportContextToProps)(ForecastComponent);
