import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { CategoryFilterComponent } from './component';

function mapContextToProps(context: ReportContextType) {
  return {
    activeReportKey: context.selectedReport!.key,
  };
}

export const CategoryFilter = withReportContext(mapContextToProps)(CategoryFilterComponent);
