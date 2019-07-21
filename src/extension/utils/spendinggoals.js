import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export const MAX_ALLOCATION_KEY = 'spending-categories';

export function getSpendingGoals() {
  const budgetVersionId = controllerLookup('application').get('budgetVersionId');
  return getToolkitStorageKey(`${MAX_ALLOCATION_KEY}.${budgetVersionId}`, []);
}

export function setSpendingGoals(categories) {
  const budgetVersionId = controllerLookup('application').get('budgetVersionId');
  return setToolkitStorageKey(`${MAX_ALLOCATION_KEY}.${budgetVersionId}`, categories);
}
