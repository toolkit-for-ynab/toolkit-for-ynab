import * as React from 'react';
import * as PropTypes from 'prop-types';

export class SpendingByCategoryComponent extends React.Component {
  static propTypes = {
    filteredTransactions: PropTypes.array.isRequired
  };

  render() {
    return <div>SpendingByCategory Transaction Count: {this.props.filteredTransactions.length}</div>;
  }
}
