import { withToolContext } from '$tools/common/components/tool-context';
import { DebtReductionCalculatorComponent } from './component';

function mapToolContextToProps(context) {
  return {
    filters: context.filters,
    // allReportableTransactions: context.allReportableTransactions,
  };
}

export const DebtReductionCalculator = withToolContext(mapToolContextToProps)(
  DebtReductionCalculatorComponent
);
