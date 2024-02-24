import * as React from 'react';
import { Collections } from 'toolkit/extension/utils/collections';
import { sortByDate } from 'toolkit/extension/utils/date';
import {
  MonthlyTransactionTotalsTable,
  TableType,
} from './components/monthly-transaction-totals-table';
import { MonthlyTotalsRow } from 'toolkit/extension/features/toolkit-reports/pages/income-vs-expense/components/monthly-totals-row';
import './styles.scss';
import { MonthlySavingsRatioRow } from './components/monthly-savings-ratio-row';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { ReportContextType } from '../../common/components/report-context';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { Moment } from 'moment';
import {
  MonthlyTotalsMap,
  PayeeMap,
  MasterCategoryMap,
  SubCategoryMap,
  MonthlyTotals,
  NormalizedExpenses,
  NormalizedIncomes,
  NormalizedNetIncomes,
  Incomes,
  Expenses,
} from './types';
import { YNABPayee } from 'toolkit/types/ynab/data/payee';
import { YNABMasterCategory } from 'toolkit/types/ynab/data/master-category';
import { YNABSubCategory } from 'toolkit/types/ynab/data/sub-category';
import { DateWithoutTime } from 'toolkit/types/ynab/window/ynab-utilities';

export const MONTHLY_TOTALS_KEY = '__totals';

const createPayeeMap = (payee: YNABPayee, monthlyTotals: MonthlyTotalsMap): PayeeMap => ({
  payee,
  monthlyTotals,
});

const createMasterCategoryMap = (
  masterCategory: YNABMasterCategory,
  monthlyTotals: MonthlyTotalsMap
): MasterCategoryMap => ({
  masterCategory,
  monthlyTotals,
  subCategories: {},
});

const createSubCategoryMap = (
  subCategory: YNABSubCategory,
  monthlyTotals: MonthlyTotalsMap
): SubCategoryMap => ({
  subCategory,
  monthlyTotals,
});

const createMonthlyTotalsMap = (date: DateWithoutTime): MonthlyTotals => ({
  date: date.clone(),
  total: 0,
  transactions: [],
});

type IncomeVsExpenseState = {
  collapsedSources: Set<string>;
  expenses: NormalizedExpenses | null;
  incomes: NormalizedIncomes | null;
  netIncome: NormalizedNetIncomes | null;
};

export class IncomeVsExpenseComponent extends React.Component<
  Pick<ReportContextType, 'filters' | 'filteredTransactions'>,
  IncomeVsExpenseState
> {
  _payeesCollection = Collections.payeesCollection;

  _subCategoriesCollection = Collections.subCategoriesCollection;

  _masterCategoriesCollection = Collections.masterCategoriesCollection;

  _localStorageKey = 'income-vs-expense-collapse-state';

  state: IncomeVsExpenseState = {
    collapsedSources: new Set(getToolkitStorageKey(this._localStorageKey, [])),
    expenses: null,
    incomes: null,
    netIncome: null,
  };

  componentDidMount() {
    this._calculateData();
  }

  componentWillUnmount() {
    setToolkitStorageKey(this._localStorageKey, [...this.state.collapsedSources]);
  }

  componentDidUpdate(prevProps: Pick<ReportContextType, 'filters' | 'filteredTransactions'>) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  render() {
    const { expenses, incomes, netIncome } = this.state;
    if (!incomes || !expenses || !netIncome) {
      return null;
    }

    return (
      <>
        <div className="tk-flex tk-mg-l-1 tk-mg-y-05">
          <button
            className="tk-button tk-button--hollow tk-button--small tk-button--text"
            onClick={this._collapseAll}
          >
            Collapse All
          </button>
          <button
            className="tk-button tk-button--hollow tk-button--small tk-button--text"
            onClick={this._expandAll}
          >
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
              threshold={parseFloat(ynabToolKit.options.SavingsRatio as string)}
              titleCell="Savings Ratio"
              emphasizeTotals
            />
          )}
        </div>
      </>
    );
  }

  _collapseAll = () => {
    this.setState((prevState: IncomeVsExpenseState) => {
      if (!prevState.incomes || !prevState.expenses) {
        return prevState;
      }
      const collapsedSources = new Set<string>();
      const prevPayees = prevState.incomes.sources;
      const prevMasterCategories = prevState.expenses.sources;
      prevPayees.forEach((source) => collapsedSources.add(source.source.entityId));

      prevMasterCategories.forEach((category) => {
        const entityId = category.source?.entityId;
        collapsedSources.add(entityId);
      });

      return { collapsedSources };
    });
  };

  _expandAll = () => {
    this.setState({ collapsedSources: new Set() });
  };

  _collapseSourceRow = (sourceId: string) => {
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

    const incomes: Incomes = {
      payees: {},
      monthlyTotals: {},
    };

    const expenses: Expenses = {
      masterCategories: {},
      monthlyTotals: {},
    };

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

  _assignIncomeTransaction(
    incomes: Incomes,
    transaction: YNABTransaction,
    transactionPayee: YNABPayee
  ) {
    const allPayeesData = incomes.payees;
    const transactionPayeeId = transactionPayee?.entityId!;
    const incomePayeeData =
      allPayeesData[transactionPayeeId] ||
      createPayeeMap(transactionPayee, this._createEmptyMonthMapFromFilters());
    if (transactionPayee.isStartingBalancePayee()) {
      return;
    }

    // global monthly income totals
    this._addTransactionToMonthlyTotals(transaction, incomes.monthlyTotals);
    this._addTransactionToMonthlyTotals(transaction, incomePayeeData.monthlyTotals);
    allPayeesData[transactionPayeeId] = incomePayeeData;
  }

  _assignExpenseTransaction(
    expenses: Expenses,
    transaction: YNABTransaction,
    transactionSubCategory: YNABSubCategory
  ) {
    // global monthly expense totals
    this._addTransactionToMonthlyTotals(transaction, expenses.monthlyTotals);

    // specific sub-category
    const transactionSubCategoryId = transactionSubCategory?.entityId!;
    const transactionMasterCategoryId = transactionSubCategory.masterCategoryId!;
    const allMasterCategoriesReportData = expenses.masterCategories;
    const masterCategory = this._masterCategoriesCollection.findItemByEntityId(
      transactionMasterCategoryId
    );
    const masterCategoryReportData =
      allMasterCategoriesReportData[transactionMasterCategoryId] ||
      createMasterCategoryMap(masterCategory, this._createEmptyMonthMapFromFilters());
    this._addTransactionToMonthlyTotals(transaction, masterCategoryReportData.monthlyTotals);

    const allSubCategoryReportData = masterCategoryReportData.subCategories;
    const subCategoryReportData =
      allSubCategoryReportData[transactionSubCategoryId] ||
      createSubCategoryMap(transactionSubCategory, this._createEmptyMonthMapFromFilters());
    this._addTransactionToMonthlyTotals(transaction, subCategoryReportData.monthlyTotals);

    allSubCategoryReportData[transactionSubCategoryId] = subCategoryReportData;
    allMasterCategoriesReportData[transactionMasterCategoryId] = masterCategoryReportData;
  }

  _addTransactionToMonthlyTotals(transaction: YNABTransaction, monthlyTotalsMap: MonthlyTotalsMap) {
    const transactionAmount = transaction.amount;
    const transactionMonth = transaction.date.clone().startOfMonth();
    const monthlyTotalsKey = transactionMonth.toISOString();

    let monthlyTotalsData = monthlyTotalsMap[monthlyTotalsKey];
    if (!monthlyTotalsData) {
      monthlyTotalsData = {
        date: transaction.date.clone().startOfMonth(),
        total: 0,
        transactions: [],
      };
      monthlyTotalsMap[monthlyTotalsKey] = monthlyTotalsData;
    }
    monthlyTotalsData.total += transactionAmount;
    monthlyTotalsData.transactions = [...monthlyTotalsData.transactions, transaction];
  }

  _createEmptyMonthMapFromFilters() {
    const { fromDate, toDate } = this.props.filters!.dateFilter;
    const date = fromDate.clone();
    const dates = {
      // TODO: is this DateWithoutTime or Moment? Or is it the same shit?
      [date.toISOString()]: createMonthlyTotalsMap(date),
    };

    while (!date.isAfter(toDate)) {
      // TODO: is this DateWithoutTime or Moment? Or is it the same shit?
      dates[date.toISOString()] = createMonthlyTotalsMap(date);
      date.addMonths(1);
    }

    return dates;
  }

  _sortAndNormalizeExpenses(expenses: Expenses) {
    const monthlyTotalsArray = Object.values(expenses.monthlyTotals);
    monthlyTotalsArray.sort(sortByDate);

    const masterCategoriesArray = Object.values(expenses.masterCategories)
      .sort((a, b) => {
        return a.masterCategory.sortableIndex - b.masterCategory.sortableIndex;
      })
      .map((masterCategoryData) => {
        const masterCategoryMonthlyTotalsArray = Object.values(masterCategoryData.monthlyTotals);
        masterCategoryMonthlyTotalsArray.sort(sortByDate);

        const subCategoriesArray = Object.values(masterCategoryData.subCategories)
          .sort((a, b) => {
            return a.subCategory.sortableIndex - b.subCategory.sortableIndex;
          })
          .map((subCategoryData) => {
            const subCategoryMonthlyTotalsArray = Object.values(subCategoryData.monthlyTotals);
            subCategoryMonthlyTotalsArray.sort(sortByDate);

            return {
              monthlyTotals: subCategoryMonthlyTotalsArray,
              source: subCategoryData.subCategory,
            };
          });

        return {
          monthlyTotals: masterCategoryMonthlyTotalsArray,
          source: masterCategoryData.masterCategory,
          sources: subCategoriesArray,
        };
      });

    return {
      monthlyTotals: monthlyTotalsArray,
      sources: masterCategoriesArray,
    };
  }

  _sortAndNormalizeIncomes(incomes: Incomes) {
    const monthlyTotalsArray = Object.values(incomes.monthlyTotals);
    monthlyTotalsArray.sort(sortByDate);

    const collator = new Intl.Collator();
    const payeesArray = Object.values(incomes.payees)
      .sort((a, b) => {
        const nameA = a.payee?.name;
        const nameB = b.payee?.name;
        return collator.compare(nameA, nameB);
      })
      .map((payeeData) => {
        const payeeMonthlyTotalsArray = Object.values(payeeData.monthlyTotals);
        payeeMonthlyTotalsArray.sort(sortByDate);

        return {
          monthlyTotals: payeeMonthlyTotalsArray,
          source: payeeData.payee,
        };
      });

    return {
      monthlyTotals: monthlyTotalsArray,
      sources: [
        {
          monthlyTotals: monthlyTotalsArray,
          source: {
            entityId: '__incomeSources',
            name: 'Income Sources',
          },
          sources: payeesArray,
        },
      ],
    };
  }

  _normalizeNetIncomes(expenses: NormalizedExpenses, incomes: NormalizedIncomes) {
    const expensesMonthlyTotals = expenses.monthlyTotals;
    const incomesMonthlyTotals = incomes.monthlyTotals;

    return incomesMonthlyTotals.map((incomeMonthData, index) => {
      const expenseMonthData = expensesMonthlyTotals[index];

      return {
        date: incomeMonthData.date.clone(),
        total: incomeMonthData.total + expenseMonthData.total,
        transactions: [...incomeMonthData.transactions, ...expenseMonthData.transactions],
      };
    });
  }
}
