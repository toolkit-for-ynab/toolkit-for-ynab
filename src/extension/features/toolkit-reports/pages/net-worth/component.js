import * as React from 'react';
import * as PropTypes from 'prop-types';

export class NetWorth extends React.Component {
  static propTypes = {
    transactions: PropTypes.array.isRequired
  };

  render() {
    return <div>NetWorth {this.props.transactions.length}</div>;
  }
}
