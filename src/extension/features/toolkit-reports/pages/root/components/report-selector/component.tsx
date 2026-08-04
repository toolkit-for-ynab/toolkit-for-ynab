import * as React from 'react';
import { REPORT_TYPES } from 'toolkit/extension/features/toolkit-reports/common/constants/report-types';
import { Popover } from 'toolkit/extension/features/toolkit-reports/common/components/popover';
import classnames from 'classnames';
import './styles.scss';

export function ReportSelectorComponent({
  activeReportKey,
  setActiveReportKey,
}: {
  activeReportKey: string;
  setActiveReportKey: (key: string) => void;
}) {
  const activeReport = REPORT_TYPES.find(({ key }) => key === activeReportKey);

  return (
    <Popover
      renderTrigger={({ toggle, isOpen }) => (
        <button
          type="button"
          className="tk-report-selector__trigger"
          onClick={toggle}
          aria-expanded={isOpen}
        >
          {activeReport?.name}
          <span className="tk-report-selector__trigger-caret" />
        </button>
      )}
    >
      {({ close }) => (
        <div className="tk-report-selector__menu">
          {REPORT_TYPES.map(({ key, name }) => {
            const itemClasses = classnames('tk-report-selector__item', {
              'tk-report-selector__item--active': activeReportKey === key,
            });

            return (
              <div
                className={itemClasses}
                key={key}
                onClick={() => {
                  setActiveReportKey(key);
                  close();
                }}
              >
                {name}
              </div>
            );
          })}
        </div>
      )}
    </Popover>
  );
}
