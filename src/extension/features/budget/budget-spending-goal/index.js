import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getSpendingGoals, setSpendingGoals } from 'toolkit/extension/utils/spendinggoals';

export class BudgetSpendingGoal extends Feature {
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
      .each((index, element) => {
        const fundingAllocations = getSpendingGoals();
        const subcategoryID = $(element).attr('data-entity-id');
        const isGoalStored = fundingAllocations.contains(subcategoryID);
        this.updateAvailableUI(element, isGoalStored);
      });

    const element = $('.budget-table-row.is-sub-category.is-checked').not(
      '.is-debt-payment-category'
    );
    const subcategoryID = $(element).attr('data-entity-id');
    if ($('.ynab-radiobutton').find("button.is-checked[data-value='MF']").length) {
      // check if the Monthly funding goal is selected.
      if (this.doesMaxLabelExist()) {
        $('.goallabel').show();
        if (getSpendingGoals().contains(subcategoryID)) {
          $('input.spend-goal').prop('checked', true);
        }
      } else {
        $('.ynab-radiobutton').append(
          "<label class='goallabel'>" +
            " <input class='spend-goal' type='checkbox' value='MG'>" +
            ' Is max spending goal.' +
            '</label> '
        );
        this.updateCategorySpendGoal();
      }
    } else if (this.doesMaxLabelExist()) {
      $('.goallabel').hide();
      this.updateCategorySpendGoal();
    }

    // When the goal inspector button is cliecked update the available UI.
    $('button.button-primary').on(
      'click',
      this.updateAvailableUI(element, getSpendingGoals().contains(subcategoryID))
    );

    const goalstate = $(element).find(
      '.ynab-new-budget-available-number.js-budget-available-number.user-data'
    )[0];
    if ($(goalstate).hasClass('positive')) {
      this.udpateGoalChart('positive');
      const goalElement = document.getElementsByClassName('goal-progress-container');
      if ($(goalElement).hasClass('spending-goal')) {
        $('.goal-progress-chart')
          .find('.percent-label')
          .text('Spent');
      }
    } else if ($(goalstate).hasClass('cautious')) {
      // TODO: update goal chart to reflect overspending.
      this.udpateGoalChart('cautious');
    }
  }

  updateAvailableUI(element, isGoalStored) {
    const goalstate = $(element).find(
      '.ynab-new-budget-available-number.js-budget-available-number.user-data'
    )[0];
    const hasSpendingGoal = $(goalstate).hasClass('spending-goal');
    // if the goal is set and spending goal has not been added then we need to reverse the warnings.
    // else if the goal has not been set and spending goal class exists we need to undo the changes.
    if (!hasSpendingGoal && isGoalStored) {
      if ($(goalstate).hasClass('cautious')) {
        $(goalstate)
          .removeClass('cautious')
          .removeClass('goal')
          .addClass('positive')
          .addClass('spending-goal');
        this.udpateGoalChart('positive');
      } else if ($(goalstate).hasClass('positive')) {
        $(goalstate)
          .removeClass('positive')
          .addClass('cautious')
          .addClass('goal')
          .addClass('spending-goal');
        this.udpateGoalChart('cautious');
      }
    } else if (hasSpendingGoal && !isGoalStored) {
      if ($(goalstate).hasClass('positive')) {
        $(goalstate)
          .removeClass('positive')
          .removeClass('spending-goal')
          .addClass('cautious')
          .addClass('goal');
      } else if ($(goalstate).hasClass('cautious')) {
        $(goalstate)
          .removeClass('positive')
          .removeClass('spending-goal')
          .addClass('cautious')
          .addClass('goal');
      }
    }
  }

  udpateGoalChart(chart) {
    const element = document.getElementsByClassName('goal-progress-container');
    if (chart === 'positive') {
      $(element)
        .removeClass('goal-warning')
        .addClass('spending-goal');
    } else {
      $(element)
        .addClass('goal-warning')
        .addClass('spending-goal');
    }
  }

  updateCategorySpendGoal() {
    const subcategoryID = $('.budget-table-row.is-sub-category.is-checked').attr('data-entity-id');
    $('.spend-goal').on('click', function() {
      const spendingGoals = getSpendingGoals();
      spendingGoals.push('1234');
      if ($(this).is(':checked')) {
        spendingGoals.push(subcategoryID);
        setSpendingGoals(spendingGoals);
      } else if (spendingGoals.contains(subcategoryID)) {
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
      this.updateAvailableUI(budgetRow, false);
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }
    if (
      changedNodes.has('budget-inspector-goals') ||
      changedNodes.has('goal-message') ||
      changedNodes.has('budget-inspector-goals-edit-section') ||
      changedNodes.has('ynab-radiobutton') ||
      changedNodes.has('is-checked') ||
      changedNodes.has('budget-inspector-subtitle')
    ) {
      this.invoke();
    }
  }

  doesMaxLabelExist() {
    return $('input.spend-goal').length;
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
