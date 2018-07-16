import * as React from 'react';
import * as PropTypes from 'prop-types';
import { CategoryFilter } from './components/category-filter';
import { DateFilter } from './components/date-filter';
import { AccountFilter } from './components/account-filter';
import './styles.scss';

export class ReportFilters extends React.Component {
  static propTypes = {
    onChanged: PropTypes.func.isRequired
  }

  state = {
    accountFilter: [],
    categoryFilter: [],
    dateFilter: []
  }

  render() {
    return (
      <div className="tk-flex">
        <div className="tk-flex">
          <div className="tk-mg-r-05">
            <CategoryFilter onChanged={this._handleCategoriesChanged} />
          </div>
          <div className="tk-mg-r-05">
            <DateFilter onChanged={this._handleDatesChanged} />
          </div>
          <div className="tk-mg-r-05">
            <AccountFilter onChange={this._handleAccountsChanged} />
          </div>
        </div>
      </div>
    );
  }

  _handleCategoriesChanged = () => {

  }

  _handleDatesChanged = () => {

  }

  _handleAccountsChanged = () => {

  }
}
