import * as React from 'react';
import * as PropTypes from 'prop-types';
import { getRouter } from 'toolkit/extension/utils/ember';

export const BudgetListItem = props => {
  const handleClick = () => {
    const router = getRouter();
    router.send('openBudget', props.budgetVersionId, props.budgetVersionName);
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
