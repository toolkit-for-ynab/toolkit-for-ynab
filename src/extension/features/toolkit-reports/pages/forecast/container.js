import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { ForecastComponent } from './component';

function mapReportContextToProps(context) {
  return {
    allReportableTransactions: context.allReportableTransactions,
  };
}

export const Forecast = withReportContext(mapReportContextToProps)(ForecastComponent);
