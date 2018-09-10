import * as React from 'react';
import * as PropTypes from 'prop-types';

export class SpendingByPayeeComponent extends React.Component {
  static propTypes = {
    filteredTransactions: PropTypes.array.isRequired
  };

  render() {
    return <div>SpendingByPayee Transaction Count: {this.props.filteredTransactions.length}</div>;
  }
}
