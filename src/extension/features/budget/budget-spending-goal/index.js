import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { getEmberView } from '../../../utils/ember';

export class BudgetSpendingGoal extends Feature {
  tkSpendingGoal = 'tk-spending-goal';

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  injectCSS() {
    return require('./index.css');
  }

  invoke() {
    $('.budget-table-row')
      .not('.budget-table-uncategorized-transactions')
      .not('.is-debt-payment-category')
      .not('.is-master-category')
      .each((_, element) => {
        this.updateAvailableUI(element);
      });

    const element = $('.budget-table-row.is-sub-category.is-checked').not(
      '.is-debt-payment-category'
    );
    const subcategoryID = $(element).attr('data-entity-id');
    if ($('.ynab-radiobutton').find("button.is-checked[data-value='MF']").length) {
      // check if the Monthly funding goal is selected.
      if (this.doesMaxLabelExist()) {
        $('.tk-goallabel').show();
        if (getSpendingGoals().contains(subcategoryID)) {
          $('input.tk-spend-goal').prop('checked', true);
        }
      } else {
        $('.ynab-radiobutton').append(
          "<label class='tk-goallabel'>" +
            " <input class='tk-spend-goal' type='checkbox' value='MG'>" +
            ' Is max spending goal.' +
            '</label> '
        );
        this.updateCategorySpendGoal();
      }
    } else if (this.doesMaxLabelExist()) {
      $('.tk-goallabel').hide();
      this.updateCategorySpendGoal();
    }

    const goalstate = $(element).find(
      '.ynab-new-budget-available-number.js-budget-available-number.user-data'
    )[0];
    const goalElement = document.getElementsByClassName('goal-progress-container');
    if ($(goalstate).hasClass(this.tkSpendingGoal)) {
      if ($(goalstate).hasClass('positive')) {
        this.udpateGoalChart('positive');
        if ($(goalElement).hasClass(this.tkSpendingGoal)) {
          $('.goal-progress-chart')
            .find('.percent-label')
            .addClass('tk-spent-label')
            .text('Spent');
        }
      } else if ($(goalstate).hasClass('cautious')) {
        // TODO: update goal chart to reflect percent of overspending.
        this.udpateGoalChart('cautious');
      } else {
        this.udpateGoalChart('positive');
      }
    } else {
      $(goalElement)
        .find('.tk-spent-label')
        .removeClass('tk-spent-label');
    }

    // When the goal inspector button is cliecked update the available UI.
    $('button.button-primary').on('click', this.updateAvailableUI(element));
  }

  updateAvailableUI(element) {
    const fundingAllocations = getSpendingGoals();
    const subcategoryID = $(element).attr('data-entity-id');
    const isGoalStored = fundingAllocations.contains(subcategoryID);
    const goalstate = $(element).find(
      '.ynab-new-budget-available-number.js-budget-available-number.user-data'
    )[0];
    const category = getEmberView(element.id, 'category');
    if (!category) {
      return;
    }

    const { subCategory, monthlySubCategoryBudget } = category.getProperties(
      'subCategory',
      'monthlySubCategoryBudget'
    );

    if (!subCategory || !monthlySubCategoryBudget) {
      return;
    }

    const { monthlyFunding } = subCategory.getProperties('monthlyFunding');
    const budget = monthlySubCategoryBudget.get('budgeted');
    const hasSpendingGoal = $(goalstate).hasClass(this.tkSpendingGoal);

    // if the goal is set and spending goal has not been added then we need to reverse the warnings.
    // else if the goal has not been set and spending goal class exists we need to undo the changes.
    if (!hasSpendingGoal && isGoalStored) {
      if (monthlyFunding > budget) {
        $(goalstate)
          .removeClass('cautious goal')
          .removeClass('zero')
          .addClass('positive')
          .addClass(this.tkSpendingGoal);
        $(element).attr(this.tkSpendingGoal, '');
        this.udpateGoalChart('positive');
      } else if (monthlyFunding < budget) {
        $(goalstate)
          .removeClass('positive')
          .removeClass('zero')
          .addClass('cautious goal')
          .addClass(this.tkSpendingGoal)
          .find('span.user-data.currency.positive')
          .removeClass('positive');
        $(element).attr(this.tkSpendingGoal, '');
        this.udpateGoalChart('cautious');
      }
    } else if (hasSpendingGoal && !isGoalStored) {
      if ($(goalstate).hasClass('positive')) {
        $(goalstate)
          .removeClass('positive')
          .removeClass(this.tkSpendingGoal)
          .addClass('cautious')
          .addClass('goal');
        $(element).removeAttr(this.tkSpendingGoal);
      } else if ($(goalstate).hasClass('cautious')) {
        $(goalstate)
          .removeClass('cautious')
          .removeClass('goal')
          .removeClass(this.tkSpendingGoal)
          .addClass('positive')
          .find('span.user-data.currency')
          .addClass('positive');
        $(element).removeAttr(this.tkSpendingGoal);
      }
    }

    if (isGoalStored && monthlyFunding === budget) {
      $(goalstate)
        .removeClass('positive')
        .removeClass('cautious goal')
        .removeClass(this.tkSpendingGoal)
        .addClass('zero');
      $(element).attr(this.tkSpendingGoal, '');
      this.udpateGoalChart('positive');
    }
  }

  udpateGoalChart(chart) {
    const element = document.getElementsByClassName('goal-progress-container');
    if (chart === 'positive') {
      $(element)
        .removeClass('goal-warning')
        .addClass(this.tkSpendingGoal);
    } else if (chart === 'cautious') {
      $(element)
        .addClass('goal-warning')
        .addClass(this.tkSpendingGoal);
    }
  }

  updateCategorySpendGoal() {
    const subcategoryID = $('.budget-table-row.is-sub-category.is-checked').attr('data-entity-id');
    $('.tk-spend-goal').on('click', function() {
      const spendingGoals = getSpendingGoals();
      if ($(this).is(':checked')) {
        spendingGoals.push(subcategoryID);
        setSpendingGoals(spendingGoals);
      } else {
        setSpendingGoals(
          spendingGoals.filter(id => {
            return id !== subcategoryID;
          })
        );
      }
    });

    const isSpendingGoal = getSpendingGoals().contains(subcategoryID);
    if (!isSpendingGoal) {
      const budgetRow = $('.budget-table-row.is-sub-category.is-checked');
      this.updateAvailableUI(budgetRow);
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }
    if (
      changedNodes.has('budget-inspector-goals') ||
      changedNodes.has('budget-table-row is-sub-category is-checked') ||
      changedNodes.has('goal-message') ||
      changedNodes.has('budget-inspector-goals-edit-section') ||
      changedNodes.has('ynab-radiobutton') ||
      changedNodes.has('is-checked')
    ) {
      this.invoke();
    }
  }

  doesMaxLabelExist() {
    return $('input.tk-spend-goal').length;
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}

export const MAX_ALLOCATION_KEY = 'spending-categories';

export function getSpendingGoals() {
  const budgetVersionId = controllerLookup('application').get('budgetVersionId');
  return getToolkitStorageKey(`${MAX_ALLOCATION_KEY}.${budgetVersionId}`, []);
}

export function setSpendingGoals(categories) {
  const budgetVersionId = controllerLookup('application').get('budgetVersionId');
  return setToolkitStorageKey(`${MAX_ALLOCATION_KEY}.${budgetVersionId}`, categories);
}
