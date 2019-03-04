import { withModalContext } from 'toolkit-reports/common/components/modal';
import { CategoryFilter } from './components/category-filter';
import { DateFilter } from './components/date-filter';
import { AccountFilter } from './components/account-filter';
import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { ReportFiltersComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filters: context.filters,
    selectedReport: context.selectedReport,
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

export const ReportFilters = withModalContext(mapModalContextToProps)(
  withReportContext(mapReportContextToProps)(ReportFiltersComponent)
);
