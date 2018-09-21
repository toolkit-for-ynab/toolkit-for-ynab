import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { sortByGettableDate } from 'toolkit/extension/utils/date';
import { mapToArray } from 'toolkit/extension/utils/helpers';
import { MonthlyTransactionTotalsTable } from './components/monthly-transaction-totals-table';
import './styles.scss';

export const MONTHLY_TOTALS_KEY = '__totals';

const createPayeeMap = (payeeId, months) => new Map([
  ['payee', Collections.payeesCollection.findItemByEntityId(payeeId)],
  ['monthlyTotals', months]
]);

const createMasterCategoryMap = (masterCategoryId, months) => new Map([
  ['masterCategory', Collections.masterCategoriesCollection.findItemByEntityId(masterCategoryId)],
  ['monthlyTotals', months],
  ['subCategories', new Map()]
]);

const createSubCategoryMap = (category, months) => new Map([
  ['subCategory', category],
  ['monthlyTotals', months]
]);

const createMonthlyTotalsMap = (date) => new Map([
  ['date', date.clone()],
  ['total', 0],
  ['transactions', []]
]);

export class IncomeVsExpenseComponent extends React.Component {
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    filteredTransactions: PropTypes.array.isRequired
  };

  state = {
    collapsedMasterCategories: new Set()
  }

  componentDidMount() {
    this._calculateData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  render() {
    const { expenses, incomeByPayee } = this.state;
    if (!incomeByPayee || !expenses) {
      return null;
    }

    return (
      <div className="tk-ive tk-overflow-scroll">
        <MonthlyTransactionTotalsTable name="Expense" data={expenses} />
      </div>
    );
  }

  _calculateData() {
    if (!this.props.filters) {
      return;
    }

    const { subCategoriesCollection } = Collections;
    const incomeByPayee = new Map();
    const expenses = new Map([
      ['masterCategories', new Map()],
      ['monthlyTotals', this._createEmptyMonthMapFromFilters()]
    ]);

    this.props.filteredTransactions.forEach((transaction) => {
      const transactionSubCategoryId = transaction.get('subCategoryId');
      if (!transactionSubCategoryId) {
        return;
      }

      const transactionSubCategory = subCategoriesCollection.findItemByEntityId(transactionSubCategoryId);
      if (!transactionSubCategory) {
        return;
      }

      if (transactionSubCategory.isIncomeCategory()) {
        this._assignIncomeTransaction(incomeByPayee, transaction);
      } else {
        this._assignExpenseTransaction(expenses, transaction, transactionSubCategory);
      }
    });

    const sortedExpenses = this._sortAndNormalizeExpenses(expenses);
    this.setState({ expenses: sortedExpenses, incomeByPayee });
  }

  _assignIncomeTransaction(incomeByPayee, transaction) {
    // const transactionAmount = transaction.get('amount');
    // const transactionMonth = transaction.get('date').clone().startOfMonth();
    // const transactionPayeeId = transaction.get('payeeId');

    // const incomePayeeData = incomeByPayee.get(transactionPayeeId) || createPayeeMap(transactionPayeeId, this._createEmptyMonthMapFromFilters());
    // const payeeMonthData = incomePayeeData.get('months').get(transactionMonth.toISOString());
    // payeeMonthData.set('total', payeeMonthData.get('total') + transactionAmount);
    // payeeMonthData.set('transactions', payeeMonthData.get('transactions').concat(transaction));

    // const incomePayeeTotalsData = incomeByPayee.get(MONTHLY_TOTALS_KEY) || createPayeeMap(MONTHLY_TOTALS_KEY, this._createEmptyMonthMapFromFilters());
    // const payeeTotalsMonth = incomePayeeTotalsData.get('months').get(transactionMonth.toISOString());
    // payeeTotalsMonth.set('total', payeeTotalsMonth.get('total') + transactionAmount);
    // payeeTotalsMonth.set('transactions', payeeTotalsMonth.get('transactions').concat(transaction));

    // incomeByPayee.set(transactionPayeeId, incomePayeeData);
    // incomeByPayee.set(MONTHLY_TOTALS_KEY, incomePayeeTotalsData);
  }

  _assignExpenseTransaction(expenses, transaction, transactionSubCategory) {
    // first, update the global expense monthly totals
    this._addTransactionToMonthlyTotals(transaction, expenses.get('monthlyTotals'));

    // now update the specific master category data
    const transactionSubCategoryId = transactionSubCategory.get('entityId');
    const transactionMasterCategoryId = transactionSubCategory.get('masterCategoryId');
    const allMasterCategoriesReportData = expenses.get('masterCategories');
    const masterCategoryReportData = allMasterCategoriesReportData.get(transactionMasterCategoryId) || createMasterCategoryMap(transactionMasterCategoryId, this._createEmptyMonthMapFromFilters());
    this._addTransactionToMonthlyTotals(transaction, masterCategoryReportData.get('monthlyTotals'));

    const allSubCategoryReportData = masterCategoryReportData.get('subCategories');
    const subCategoryReportData = allSubCategoryReportData.get(transactionSubCategoryId) || createSubCategoryMap(transactionSubCategory, this._createEmptyMonthMapFromFilters());
    this._addTransactionToMonthlyTotals(transaction, subCategoryReportData.get('monthlyTotals'));

    allSubCategoryReportData.set(transactionSubCategoryId, subCategoryReportData);
    allMasterCategoriesReportData.set(transactionMasterCategoryId, masterCategoryReportData);
  }

  _addTransactionToMonthlyTotals(transaction, monthlyTotalsMap) {
    const transactionAmount = transaction.get('amount');
    const transactionMonth = transaction.get('date').clone().startOfMonth();
    const monthlyTotalsKey = transactionMonth.toISOString();

    const monthlyTotalsData = monthlyTotalsMap.get(monthlyTotalsKey);
    monthlyTotalsData.set('total', monthlyTotalsData.get('total') + transactionAmount);
    monthlyTotalsData.set('transactions', monthlyTotalsData.get('transactions').concat(transaction));
  }

  _createEmptyMonthMapFromFilters() {
    const { fromDate, toDate } = this.props.filters.dateFilter;
    const date = fromDate.clone();
    const dates = new Map([
      [date.toISOString(), createMonthlyTotalsMap(date)]
    ]);

    while (date.isBefore(toDate)) {
      dates.set(date.toISOString(), createMonthlyTotalsMap(date));
      date.addMonths(1);
    }

    return dates;
  }

  _sortAndNormalizeExpenses(expenses) {
    const monthlyTotalsArray = mapToArray(expenses.get('monthlyTotals'));
    monthlyTotalsArray.sort(sortByGettableDate);

    const masterCategoriesArray = mapToArray(expenses.get('masterCategories')).sort((a, b) => {
      return a.get('masterCategory').sortableIndex - b.get('masterCategory').sortableIndex;
    }).map((masterCategoryData) => {
      const masterCategoryMonthlyTotalsArray = mapToArray(masterCategoryData.get('monthlyTotals'));
      masterCategoryMonthlyTotalsArray.sort(sortByGettableDate);

      const subCategoriesArray = mapToArray(masterCategoryData.get('subCategories')).sort((a, b) => {
        return a.get('subCategory').sortableIndex - b.get('subCategory').sortableIndex;
      }).map((subCategoryData) => {
        const subCategoryMonthlyTotalsArray = mapToArray(subCategoryData.get('monthlyTotals'));
        subCategoryMonthlyTotalsArray.sort(sortByGettableDate);

        return new Map([
          ['monthlyTotals', subCategoryMonthlyTotalsArray],
          ['source', subCategoryData.get('subCategory')]
        ]);
      });

      return new Map([
        ['monthlyTotals', masterCategoryMonthlyTotalsArray],
        ['source', masterCategoryData.get('masterCategory')],
        ['sources', subCategoriesArray]
      ]);
    });

    return new Map([
      ['monthlyTotals', monthlyTotalsArray],
      ['sources', masterCategoriesArray]
    ]);
  }
}
