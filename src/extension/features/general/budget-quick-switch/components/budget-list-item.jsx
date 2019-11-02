import * as React from 'react';
import * as PropTypes from 'prop-types';
// import { getRouter } from 'toolkit/extension/utils/ember';
import { getApplicationService } from 'toolkit/extension/utils/ynab';

export const BudgetListItem = props => {
  const handleClick = () => {
    const appService = getApplicationService();
    appService.loadBudget(props.budgetVersionId, props.budgetVersionName);
  };

  return (
    <li onClick={handleClick}>
      <button>
        <i className="flaticon stroke mail-1" />
        {` Open ${props.budgetVersionName}`}
      </button>
    </li>
  );
};

BudgetListItem.propTypes = {
  budgetVersionId: PropTypes.string.isRequired,
  budgetVersionName: PropTypes.string.isRequired,
};
