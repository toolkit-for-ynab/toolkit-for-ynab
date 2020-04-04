import { withToolContext } from '$tools/common/components/tool-context';
import { ToolSelectorComponent } from './component';

function mapContextToProps(context) {
  return {
    activeToolKey: context.selectedTool.key,
    setActiveToolKey: context.setActiveToolKey,
  };
}

export const ToolSelector = withToolContext(mapContextToProps)(ToolSelectorComponent);
