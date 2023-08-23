import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { sortByGettableDate } from 'toolkit/extension/utils/date';
import { mapToArray } from 'toolkit/extension/utils/helpers';
import {
  MonthlyTransactionTotalsTable,
  TableType,
} from './components/monthly-transaction-totals-table';
import { MonthlyTotalsRow } from 'toolkit-reports/pages/income-vs-expense/components/monthly-totals-row';
import './styles.scss';
import { MonthlySavingsRatioRow } from './components/monthly-savings-ratio-row';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export const MONTHLY_TOTALS_KEY = '__totals';

const createPayeeMap = (payee, months) =>
  new Map([
    ['payee', payee],
    ['monthlyTotals', months],
  ]);

const createMasterCategoryMap = (masterCategory, months) =>
  new Map([
    ['masterCategory', masterCategory],
    ['monthlyTotals', months],
    ['subCategories', new Map()],
  ]);

const createSubCategoryMap = (category, months) =>
  new Map([
    ['subCategory', category],
    ['monthlyTotals', months],
  ]);

const createMonthlyTotalsMap = (date) =>
  new Map([
    ['date', date.clone()],
    ['total', 0],
    ['transactions', []],
  ]);

export class IncomeVsExpenseComponent extends React.Component {
  _payeesCollection = Collections.payeesCollection;

  _subCategoriesCollection = Collections.subCategoriesCollection;

  _masterCategoriesCollection = Collections.masterCategoriesCollection;

  _localStorageKey = 'income-vs-expense-collapse-state';

  state = {
    collapsedSources: new Set(getToolkitStorageKey(this._localStorageKey, [])),
  };

  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    filteredTransactions: PropTypes.array.isRequired,
  };

  componentDidMount() {
    this._calculateData();
  }

  componentWillUnmount() {
    setToolkitStorageKey(this._localStorageKey, [...this.state.collapsedSources]);
  }

  componentDidUpdate(prevProps) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  render() {
    const { expenses, incomes, netIncome } = this.state;
    if (!incomes || !expenses) {
      return null;
    }

    return (
      <>
        <div className="tk-flex tk-mg-l-1">
          <button
            className="tk-button tk-button--small tk-button--text"
            onClick={this._collapseAll}
          >
            Collapse All
          </button>
          <button className="tk-button tk-button--small tk-button--text" onClick={this._expandAll}>
            Expand All
          </button>
        </div>
        <div className="tk-ive tk-mg-r-1 tk-mg-b-1 tk-mg-l-1 tk-overflow-scroll">
          <div className="tk-mg-b-1">
            <MonthlyTransactionTotalsTable
              type={TableType.Income}
              data={incomes}
              collapsedSources={this.state.collapsedSources}
              onCollapseSource={this._collapseSourceRow}
            />
          </div>
          <div className="tk-mg-b-1">
            <MonthlyTransactionTotalsTable
              type={TableType.Expense}
              data={expenses}
              collapsedSources={this.state.collapsedSources}
              onCollapseSource={this._collapseSourceRow}
            />
          </div>
          <MonthlyTotalsRow
            className="tk-ive__net-income"
            monthlyTotals={netIncome}
            titleCell="Net Income"
            emphasizeTotals
          />
          {!!ynabToolKit.options.SavingsRatio && (
            <MonthlySavingsRatioRow
              className="tk-ive__net-income"
              incomes={incomes}
              expenses={expenses}
              threshold={parseFloat(ynabToolKit.options.SavingsRatio)}
              titleCell="Savings Ratio"
              emphasizeTotals
            />
          )}
        </div>
      </>
    );
  }

  _collapseAll = () => {
    this.setState((prevState) => {
      const collapsedSources = new Set();
      const prevPayees = prevState.incomes.get('sources');
      const prevMasterCategories = prevState.expenses.get('sources');
      prevPayees.forEach((payee) => {
        const entityId = payee.get('source')?.entityId ?? payee.get('source')?.get('entityId');
        collapsedSources.add(entityId);
      });

      prevMasterCategories.forEach((category) => {
        const entityId =
          category.get('source')?.entityId ?? category.get('source')?.get('entityId');
        collapsedSources.add(entityId);
      });

      return { collapsedSources };
    });
  };

  _expandAll = () => {
    this.setState({ collapsedSources: new Set() });
  };

  _collapseSourceRow = (sourceId) => {
    this.setState((prevState) => {
      const { collapsedSources } = prevState;
      if (collapsedSources.has(sourceId)) {
        collapsedSources.delete(sourceId);
      } else {
        collapsedSources.add(sourceId);
      }

      return { collapsedSources };
    });
  };

  _calculateData() {
    if (!this.props.filters) {
      return;
    }

    const incomes = new Map([
      ['payees', new Map()],
      ['monthlyTotals', this._createEmptyMonthMapFromFilters()],
    ]);

    const expenses = new Map([
      ['masterCategories', new Map()],
      ['monthlyTotals', this._createEmptyMonthMapFromFilters()],
    ]);

    this.props.filteredTransactions.forEach((transaction) => {
      const transactionSubCategoryId = transaction.subCategoryId;
      if (!transactionSubCategoryId) {
        return;
      }

      const transactionSubCategory =
        this._subCategoriesCollection.findItemByEntityId(transactionSubCategoryId);
      if (!transactionSubCategory) {
        return;
      }

      if (transactionSubCategory.isImmediateIncomeCategory()) {
        const transactionPayeeId = transaction.payeeId || transaction.parentTransaction?.payeeId;
        if (!transactionPayeeId) {
          return;
        }

        const transactionPayee = this._payeesCollection.findItemByEntityId(transactionPayeeId);
        if (!transactionPayee) {
          return;
        }

        this._assignIncomeTransaction(incomes, transaction, transactionPayee);
      } else {
        this._assignExpenseTransaction(expenses, transaction, transactionSubCategory);
      }
    });

    const normalizedExpenses = this._sortAndNormalizeExpenses(expenses);
    const normalizedIncomes = this._sortAndNormalizeIncomes(incomes);
    const normalizedNetIncome = this._normalizeNetIncomes(normalizedExpenses, normalizedIncomes);
    this.setState({
      expenses: normalizedExpenses,
      incomes: normalizedIncomes,
      netIncome: normalizedNetIncome,
    });
  }

  _assignIncomeTransaction(incomes, transaction, transactionPayee) {
    const allPayeesData = incomes.get('payees');
    const transactionPayeeId = transactionPayee?.entityId;
    const incomePayeeData =
      allPayeesData.get(transactionPayeeId) ||
      createPayeeMap(transactionPayee, this._createEmptyMonthMapFromFilters());
    if (transactionPayee.isStartingBalancePayee()) {
      return;
    }

    // global monthly income totals
    this._addTransactionToMonthlyTotals(transaction, incomes.get('monthlyTotals'));
    this._addTransactionToMonthlyTotals(transaction, incomePayeeData.get('monthlyTotals'));
    allPayeesData.set(transactionPayeeId, incomePayeeData);
  }

  _assignExpenseTransaction(expenses, transaction, transactionSubCategory) {
    // global monthly expense totals
    this._addTransactionToMonthlyTotals(transaction, expenses.get('monthlyTotals'));

    // specific sub-category
    const transactionSubCategoryId = transactionSubCategory?.entityId;
    const transactionMasterCategoryId = transactionSubCategory.masterCategoryId;
    const allMasterCategoriesReportData = expenses.get('masterCategories');
    const masterCategory = this._masterCategoriesCollection.findItemByEntityId(
      transactionMasterCategoryId
    );
    const masterCategoryReportData =
      allMasterCategoriesReportData.get(transactionMasterCategoryId) ||
      createMasterCategoryMap(masterCategory, this._createEmptyMonthMapFromFilters());
    this._addTransactionToMonthlyTotals(transaction, masterCategoryReportData.get('monthlyTotals'));

    const allSubCategoryReportData = masterCategoryReportData.get('subCategories');
    const subCategoryReportData =
      allSubCategoryReportData.get(transactionSubCategoryId) ||
      createSubCategoryMap(transactionSubCategory, this._createEmptyMonthMapFromFilters());
    this._addTransactionToMonthlyTotals(transaction, subCategoryReportData.get('monthlyTotals'));

    allSubCategoryReportData.set(transactionSubCategoryId, subCategoryReportData);
    allMasterCategoriesReportData.set(transactionMasterCategoryId, masterCategoryReportData);
  }

  _addTransactionToMonthlyTotals(transaction, monthlyTotalsMap) {
    const transactionAmount = transaction.amount;
    const transactionMonth = transaction.date.clone().startOfMonth();
    const monthlyTotalsKey = transactionMonth.toISOString();

    const monthlyTotalsData = monthlyTotalsMap.get(monthlyTotalsKey);
    monthlyTotalsData.set('total', monthlyTotalsData.get('total') + transactionAmount);
    monthlyTotalsData.set(
      'transactions',
      monthlyTotalsData.get('transactions').concat(transaction)
    );
  }

  _createEmptyMonthMapFromFilters() {
    const { fromDate, toDate } = this.props.filters.dateFilter;
    const date = fromDate.clone();
    const dates = new Map([[date.toISOString(), createMonthlyTotalsMap(date)]]);

    while (!date.isAfter(toDate)) {
      dates.set(date.toISOString(), createMonthlyTotalsMap(date));
      date.addMonths(1);
    }

    return dates;
  }

  _sortAndNormalizeExpenses(expenses) {
    const monthlyTotalsArray = mapToArray(expenses.get('monthlyTotals'));
    monthlyTotalsArray.sort(sortByGettableDate);

    const masterCategoriesArray = mapToArray(expenses.get('masterCategories'))
      .sort((a, b) => {
        return a.get('masterCategory').sortableIndex - b.get('masterCategory').sortableIndex;
      })
      .map((masterCategoryData) => {
        const masterCategoryMonthlyTotalsArray = mapToArray(
          masterCategoryData.get('monthlyTotals')
        );
        masterCategoryMonthlyTotalsArray.sort(sortByGettableDate);

        const subCategoriesArray = mapToArray(masterCategoryData.get('subCategories'))
          .sort((a, b) => {
            return a.get('subCategory').sortableIndex - b.get('subCategory').sortableIndex;
          })
          .map((subCategoryData) => {
            const subCategoryMonthlyTotalsArray = mapToArray(subCategoryData.get('monthlyTotals'));
            subCategoryMonthlyTotalsArray.sort(sortByGettableDate);

            return new Map([
              ['monthlyTotals', subCategoryMonthlyTotalsArray],
              ['source', subCategoryData.get('subCategory')],
            ]);
          });

        return new Map([
          ['monthlyTotals', masterCategoryMonthlyTotalsArray],
          ['source', masterCategoryData.get('masterCategory')],
          ['sources', subCategoriesArray],
        ]);
      });

    return new Map([
      ['monthlyTotals', monthlyTotalsArray],
      ['sources', masterCategoriesArray],
    ]);
  }

  _sortAndNormalizeIncomes(incomes) {
    const monthlyTotalsArray = mapToArray(incomes.get('monthlyTotals'));
    monthlyTotalsArray.sort(sortByGettableDate);

    const payeesArray = mapToArray(incomes.get('payees'))
      .sort((a, b) => {
        const nameA = a?.payee?.name;
        const nameB = b?.payee?.name;
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      })
      .map((payeeData) => {
        const payeeMonthlyTotalsArray = mapToArray(payeeData.get('monthlyTotals'));
        payeeMonthlyTotalsArray.sort(sortByGettableDate);

        return new Map([
          ['monthlyTotals', payeeMonthlyTotalsArray],
          ['source', payeeData.get('payee')],
        ]);
      });

    return new Map([
      ['monthlyTotals', monthlyTotalsArray],
      [
        'sources',
        [
          new Map([
            ['monthlyTotals', monthlyTotalsArray],
            [
              'source',
              new Map([
                ['entityId', '__incomeSources'],
                ['name', 'Income Sources'],
              ]),
            ],
            ['sources', payeesArray],
          ]),
        ],
      ],
    ]);
  }

  _normalizeNetIncomes(expenses, incomes) {
    const expensesMonthlyTotals = expenses.get('monthlyTotals');
    const incomesMonthlyTotals = incomes.get('monthlyTotals');

    return incomesMonthlyTotals.map((incomeMonthData, index) => {
      const expenseMonthData = expensesMonthlyTotals[index];

      return new Map([
        ['date', incomeMonthData.get('date').clone()],
        ['total', incomeMonthData.get('total') + expenseMonthData.get('total')],
        [
          'transactions',
          incomeMonthData.get('transactions').concat(expenseMonthData.get('transactions')),
        ],
      ]);
    });
  }
}
