import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Collections } from 'toolkit/extension/utils/collections';
import { mapToArray } from 'toolkit/extension/utils/helpers';
import { ALL_OTHER_DATA_COLOR, PIE_CHART_COLORS } from 'toolkit-reports/common/constants/colors';
import { showTransactionModal } from 'toolkit-reports/utils/show-transaction-modal';
import './styles.scss';

const createPayeeMap = payee => new Map([['payee', payee], ['total', 0], ['transactions', []]]);

export class SpendingCalendarComponent extends React.Component {
  _subCategoriesCollection = Collections.subCategoriesCollection;
  _payeesCollection = Collections.payeesCollection;

  static propTypes = {
    filteredTransactions: PropTypes.array.isRequired,
  };

  state = {
    seriesData: null,
    spendingByPayeeData: null,
    payeeCount: 20,
  };

  componentDidMount() {
    this._calculateData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  render() {
    const { _seriesData, _spendingByPayeeData } = this.state;

    return (
      <div className="tk-flex tk-flex-grow">
        <div id="tk-spending-calendar">Calendar here</div>
      </div>
    );
  }

  _calculateData() {
    const dayTransactionsData = new Map();

    this.setState(
      {
        dayTransactionsData: dayTransactionsData,
      },
      this._renderReport
    );
  }

  _renderReport = () => {
    // this.setState({ chart, seriesData });
  };
}
