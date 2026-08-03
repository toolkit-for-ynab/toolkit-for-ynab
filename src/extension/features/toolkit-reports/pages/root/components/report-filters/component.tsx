import * as React from 'react';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import {
  FiltersType,
  SelectedReportContextPropType,
} from 'toolkit-reports/common/components/report-context/component';
import classnames from 'classnames';
import { Popover } from 'toolkit/extension/features/toolkit-reports/common/components/popover';
import './styles.scss';
import { AccountFilter } from './components/account-filter';
import { CategoryFilter } from './components/category-filter';
import { DateFilter } from './components/date-filter';

export type ReportFiltersProps = {
  filters: FiltersType;
  selectedReport: SelectedReportContextPropType;
  setFilters: (filter: FiltersType) => void;
};

export function ReportFiltersComponent({
  filters,
  selectedReport,
  setFilters,
}: ReportFiltersProps) {
  const { disableCategoryFilter, includeTrackingAccounts } = selectedReport.filterSettings;
  const ExtraComponent = selectedReport.filtersExtraComponent;
  const { accountFilterIds, categoryFilterIds, dateFilter } = filters;

  const categoryButtonClasses = classnames(
    'tk-button',
    'tk-button--hollow',
    'tk-button--medium',
    'tk-button--text',
    {
      'tk-button--disabled': disableCategoryFilter,
    },
  );

  const applyFilters = (newFilters: Partial<FiltersType>) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="tk-flex tk-flex-shrink-none">
      <div className="tk-flex">
        <div className="tk-mg-r-05">
          <Popover
            disabled={disableCategoryFilter}
            renderTrigger={({ toggle }) => (
              <button onClick={toggle} className={categoryButtonClasses}>
                {categoryFilterIds.size ? 'Some Categories' : 'All Categories'}
              </button>
            )}
          >
            {({ close }) => (
              <CategoryFilter
                categoryFilterIds={categoryFilterIds}
                onCancel={close}
                onSave={(categories) => {
                  close();
                  applyFilters({ categoryFilterIds: categories });
                }}
              />
            )}
          </Popover>
        </div>
        <div className="tk-mg-r-05">
          <Popover
            renderTrigger={({ toggle }) => (
              <button
                onClick={toggle}
                className="tk-button tk-button--hollow tk-button--medium tk-button--text"
              >
                {accountFilterIds.size ? 'Some Accounts' : 'All Accounts'}
              </button>
            )}
          >
            {({ close }) => (
              <AccountFilter
                accountFilterIds={accountFilterIds}
                includeTrackingAccounts={includeTrackingAccounts}
                onCancel={close}
                onSave={(accounts) => {
                  close();
                  applyFilters({ accountFilterIds: accounts });
                }}
              />
            )}
          </Popover>
        </div>
        <div className="tk-mg-r-05">
          <Popover
            renderTrigger={({ toggle }) => (
              <button
                onClick={toggle}
                className="tk-button tk-button--hollow tk-button--medium tk-button--text"
              >
                {`${localizedMonthAndYear(dateFilter.fromDate)} - ${localizedMonthAndYear(
                  dateFilter.toDate,
                )}`}
              </button>
            )}
          >
            {({ close }) => (
              <DateFilter
                dateFilter={dateFilter}
                onCancel={close}
                onSave={(newDateFilter) => {
                  close();
                  applyFilters({ dateFilter: newDateFilter });
                }}
              />
            )}
          </Popover>
        </div>
      </div>
      {!!ExtraComponent && <ExtraComponent />}
    </div>
  );
}
