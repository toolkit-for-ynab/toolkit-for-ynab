import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { ForecastComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filteredTransactions: context.filteredTransactions,
  };
}

export const Forecast = withReportContext(mapReportContextToProps)(ForecastComponent);
