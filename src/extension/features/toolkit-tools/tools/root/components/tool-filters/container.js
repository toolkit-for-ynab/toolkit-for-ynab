import { withModalContext } from '$tools/common/components/modal';
import { CategoryFilter } from './components/category-filter';
import { DateFilter } from './components/date-filter';
import { AccountFilter } from './components/account-filter';
import { withToolContext } from '$tools/common/components/tool-context';
import { ToolFiltersComponent } from './component';

function mapToolContextToProps(context) {
  return {
    filters: context.filters,
    selectedTool: context.selectedTool,
    setFilters: context.setFilters,
  };
}

function mapModalContextToProps({ closeModal, showModal }) {
  return {
    closeModal,
    showAccountFilterModal: props => showModal(AccountFilter, props),
    showDateSelectorModal: props => showModal(DateFilter, props),
    showCategoryFilterModal: props => showModal(CategoryFilter, props),
  };
}

export const ToolFilters = withModalContext(mapModalContextToProps)(
  withToolContext(mapToolContextToProps)(ToolFiltersComponent)
);
