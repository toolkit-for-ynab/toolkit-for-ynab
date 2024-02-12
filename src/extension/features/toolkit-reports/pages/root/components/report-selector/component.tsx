import * as React from 'react';
import { REPORT_TYPES } from 'toolkit/extension/features/toolkit-reports/common/constants/report-types';
import classnames from 'classnames';
import './styles.scss';

export class ReportSelectorComponent extends React.Component<{
  activeReportKey: string;
  setActiveReportKey: (key: string) => void;
}> {
  render() {
    return (
      <div className="tk-report-selector">
        {REPORT_TYPES.map(({ key, name }) => {
          const reportNameClasses = classnames('tk-report-selector__item', {
            'tk-report-selector__item--active': this.props.activeReportKey === key,
          });

          return (
            <div
              className={reportNameClasses}
              data-report-key={key}
              key={key}
              onClick={this._onSelect}
            >
              {name}
            </div>
          );
        })}
      </div>
    );
  }

  _onSelect = ({ currentTarget }: React.MouseEvent<HTMLDivElement>) => {
    this.props.setActiveReportKey(currentTarget.dataset.reportKey!);
  };
}
