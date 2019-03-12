import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { CategoryFilterComponent } from './component';

function mapContextToProps(context) {
  return {
    activeReportKey: context.selectedReport.key,
  };
}

export const CategoryFilter = withReportContext(mapContextToProps)(CategoryFilterComponent);
