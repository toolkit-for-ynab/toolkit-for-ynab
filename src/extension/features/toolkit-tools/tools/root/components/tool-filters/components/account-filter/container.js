import { withToolContext } from '$tools/common/components/tool-context';
import { AccountFilterComponent } from './component';

function mapContextToProps(context) {
  return {
    activeToolKey: context.selectedTool.key,
  };
}

export const AccountFilter = withToolContext(mapContextToProps)(AccountFilterComponent);
