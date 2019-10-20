import * as React from 'react';
import * as PropTypes from 'prop-types';
import { REPORT_TYPES } from 'toolkit/extension/features/toolkit-reports/common/constants/report-types';
import classnames from 'classnames';
import './styles.scss';

export class ReportSelectorComponent extends React.Component {
  static propTypes = {
    activeReportKey: PropTypes.string.isRequired,
    setActiveReportKey: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div className="tk-flex tk-pd-l-05 tk-flex-shrink-none tk-align-items-center tk-report-selector">
        {REPORT_TYPES.map(({ key, name }) => {
          const reportNameClasses = classnames('tk-mg-r-05', 'tk-report-selector__item', {
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

  _onSelect = ({ currentTarget }) => {
    this.props.setActiveReportKey(currentTarget.dataset.reportKey);
  };
}
