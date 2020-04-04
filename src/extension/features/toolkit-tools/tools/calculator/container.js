import { withToolContext } from '$tools/common/components/tool-context';
import { CalculatorComponent } from './component';

function mapToolContextToProps(context) {
  return {
    filters: context.filters,
  };
}

export const Calculator = withToolContext(mapToolContextToProps)(CalculatorComponent);
