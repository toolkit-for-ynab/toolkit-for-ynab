import {
  ModalContextType,
  withModalContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/modal';
import { CategoryFilter } from './components/category-filter';
import { DateFilter } from './components/date-filter';
import { AccountFilter } from './components/account-filter';
import {
  ReportContextType,
  withReportContext,
} from 'toolkit/extension/features/toolkit-reports/common/components/report-context';
import { ReportFiltersComponent } from './component';
import { ComponentProps } from 'react';

function mapReportContextToProps(context: ReportContextType) {
  return {
    filters: context.filters,
    selectedReport: context.selectedReport,
    setFilters: context.setFilters,
  };
}

function mapModalContextToProps({ closeModal, showModal }: ModalContextType) {
  return {
    closeModal,
    showAccountFilterModal: (props: ComponentProps<typeof AccountFilter>) =>
      showModal(AccountFilter, props),
    showDateSelectorModal: (props: ComponentProps<typeof DateFilter>) =>
      showModal(DateFilter, props),
    showCategoryFilterModal: (props: ComponentProps<typeof CategoryFilter>) =>
      showModal(CategoryFilter, props),
  };
}

export const ReportFilters = withModalContext(mapModalContextToProps)(
  withReportContext(mapReportContextToProps)(ReportFiltersComponent)
);
