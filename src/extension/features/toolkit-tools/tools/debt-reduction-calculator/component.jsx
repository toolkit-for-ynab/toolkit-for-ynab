import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from '$toolkit/extension/utils/currency';
import { localizedMonthAndYear, sortByGettableDate } from '$toolkit/extension/utils/date';
import { l10n } from '$toolkit/extension/utils/toolkit';

export class DebtReductionCalculatorComponent extends React.Component {
  state = {};

  componentDidMount() {
    // this._calculateData();
  }

  componentDidUpdate(prevProps) {
    // if (this.props.filters !== prevProps.filters) {
    //  this._calculateData();
    // }
  }

  render() {
    return (
      <div className="tk-flex tk-flex-column tk-flex-grow">
        <div className="tk-flex tk-justify-content-end">
          <p>Hello World</p>
        </div>
      </div>
    );
  }
}
/*
  _renderReport = () => {
    const _this = this;

    this.setState({ chart });
  };

 
    this.setState(
      {
        hoveredData: {
          assets: assets[assets.length - 1] || 0,
          debts: debts[debts.length - 1] || 0,
          netWorth: netWorths[netWorths.length - 1] || 0,
        },
        toolData: {
          labels: filteredLabels,
          debts: filteredDebts,
          assets: filteredAssets,
          netWorths: filteredNetWorths,
        },
      },
      this._renderReport
    );
  }
}
*/
