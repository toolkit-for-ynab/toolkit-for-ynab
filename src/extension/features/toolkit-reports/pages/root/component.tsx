import * as React from 'react';
import { withModalContextProvider } from 'toolkit/extension/features/toolkit-reports/common/components/modal';
import {
  ReportContextType,
  withReportContext,
} from 'toolkit-reports/common/components/report-context/component';
import { ReportFilters } from './components/report-filters';
import { ReportSelector } from './components/report-selector';
import './styles.scss';
import { withReportContextProvider } from '../../common/components/report-context/reports-provider';
import { useDocumentTitle } from 'toolkit/hooks/useDocumentTitle';
import { REPORT_TYPES } from '../../common/constants/report-types';

function mapContextToProps(context: ReportContextType) {
  return {
    selectedReport: context.selectedReport,
  };
}

const Noop = () => null;

export const RootComponent = ({
  selectedReport,
}: {
  selectedReport: ReportContextType['selectedReport'];
}) => {
  const Report = selectedReport ? selectedReport.component : Noop;
  const name = REPORT_TYPES.find((r) => r.key === selectedReport?.key)?.name || 'Toolkit Reports';
  useDocumentTitle(name);

  return (
    <div className="tk-reports-root tk-flex tk-flex-column tk-full-height">
      <ReportSelector />
      <ReportFilters />
      <Report />
    </div>
  );
};

export const Root = withReportContextProvider(
  withModalContextProvider(withReportContext(mapContextToProps)(RootComponent))
);
