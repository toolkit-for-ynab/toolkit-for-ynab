import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withModalContextProvider } from 'toolkit-reports/common/components/modal';
import {
  SelectedReportContextPropType,
  withReportContext,
  withReportContextProvider,
} from 'toolkit-reports/common/components/report-context/component';
import { ReportFilters } from './components/report-filters';
import { ReportSelector } from './components/report-selector';
import './styles.scss';

function mapContextToProps(context) {
  return {
    selectedReport: context.selectedReport,
  };
}

export class RootComponent extends React.Component {
  static propTypes = {
    selectedReport: PropTypes.shape(SelectedReportContextPropType),
  };

  state = {
    filteredTransactions: [],
  };

  render() {
    const { component: Report } = this.props.selectedReport;

    return (
      <div className="tk-reports-root tk-flex tk-flex-column tk-full-height">
        <ReportSelector />
        <ReportFilters />
        <Report />
      </div>
    );
  }
}

export const Root = withReportContextProvider(
  withModalContextProvider(withReportContext(mapContextToProps)(RootComponent))
);
