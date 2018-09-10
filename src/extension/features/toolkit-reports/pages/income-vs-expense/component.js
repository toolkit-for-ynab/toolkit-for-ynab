import * as React from 'react';
import * as PropTypes from 'prop-types';

export class IncomeVsExpenseComponent extends React.Component {
  static propTypes = {
    filteredTransactions: PropTypes.array.isRequired
  };

  render() {
    return <div>IncomeVsExpense Transaction Count: {this.props.filteredTransactions.length}</div>;
  }
}
