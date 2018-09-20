import * as React from 'react';
import * as PropTypes from 'prop-types';
import { SubCategoryRow } from './components/sub-category-row/component';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class MasterCategoryRow extends React.Component {
  static propTypes = {
    masterCategory: PropTypes.object.isRequired,
    monthlyTotals: PropTypes.array.isRequired,
    subCategories: PropTypes.array.isRequired,
    isCollapsed: PropTypes.bool.isRequired,
    onToggleCollapse: PropTypes.func.isRequired
  }

  render() {
    const subCategoryRows = this.props.subCategories.map((subCategoryData) => {
      const subCategory = subCategoryData.get('subCategory');
      const monthlyTotals = subCategoryData.get('monthlyTotals');

      return (
        <SubCategoryRow
          key={subCategory.get('entityId')}
          subCategory={subCategory}
          monthlyTotals={monthlyTotals}
        />
      );
    });

    const masterCategoryTotals = this.props.monthlyTotals.map((monthData) => {
      const key = `${monthData.get('date').toISOString()}`;

      return (
        <div key={key} className="tk-income-vs-expense__cell--data">
          {formatCurrency(monthData.get('total'))}
        </div>
      );
    });

    return (
      <div className="tk-mg-b-05">
        <div className="tk-flex">
          <div className="tk-income-vs-expense__cell--title" onClick={this._toggleMasterCategory}>
            <div>{this.props.masterCategory.get('name')}</div>
          </div>
          {this.props.isCollapsed && (
            <div className="tk-flex tk-income-vs-expense__row--title">{masterCategoryTotals}</div>
          )}
        </div>
        {!this.props.isCollapsed && (
          <div>
            {subCategoryRows}
            <div className="tk-flex tk-income-vs-expense__row--title">
              <div className="tk-income-vs-expense__cell--title">
                Total {this.props.masterCategory.get('name')}
              </div>

              <div className="tk-flex">{masterCategoryTotals}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  _toggleMasterCategory = () => {
    this.props.onToggleCollapse(this.props.masterCategory.get('entityId'));
  }
}
