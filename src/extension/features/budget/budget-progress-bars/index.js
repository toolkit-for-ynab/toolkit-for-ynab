import { Feature } from 'toolkit/extension/features/feature';
import {
  isCurrentRouteBudgetPage,
  getEntityManager,
  getSelectedMonth,
  isCurrentMonthSelected,
} from 'toolkit/extension/utils/ynab';
import { pacingForCategory } from 'toolkit/extension/utils/pacing';
import { getEmberView } from 'toolkit/extension/utils/ember';

const progressIndicatorWidth = 0.005; // Current month progress indicator width

export class BudgetProgressBars extends Feature {
  // Supporting functions, or variables, etc
  loadCategories = true;

  selMonth;

  subCats = [];

  internalIdBase;

  monthProgress;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  // Takes N colors and N-1 sorted points from (0, 1) to make color1|color2|color3 bg style.
  generateProgressBarStyle(colors, points) {
    const pointsPercent = [0, ...points, 1].map(p => p * 100);
    return colors.reduce(
      (reduced, color, index) =>
        reduced +
        `${color} ${pointsPercent[index]}%, ${color} ${pointsPercent[index + 1]}%${
          index + 1 === colors.length ? ')' : ', '
        }`,
      'linear-gradient(to right, '
    );
  }

  getCalculation(subCategoryName) {
    const subCategory = this.subCats.find(ele => ele.toolkitName === subCategoryName);

    if (subCategory) {
      const crazyInternalId = this.internalIdBase + subCategory.entityId;
      const calculation = getEntityManager().getMonthlySubCategoryBudgetCalculationById(
        crazyInternalId
      );
      if (!calculation) {
        return;
      }
      /**
       * Add a few values from the subCategory object to the calculation object.
       */
      calculation.targetBalance = subCategory.getGoalTargetAmount();
      calculation.goalType = subCategory.getGoalType();
      calculation.goalCreationMonth = subCategory.goalCreationMonth
        ? subCategory.goalCreationMonth.toString().substr(0, 7)
        : '';
      /**
       * If the month the goal was created in is greater than the selected month, null the goal type to prevent further
       * processing.
       */
      if (calculation.goalCreationMonth && calculation.goalCreationMonth > this.selMonth) {
        calculation.goalType = null;
      }

      return calculation;
    }
  }

  addGoalProgress(subCategoryName, target) {
    const calculation = this.getCalculation(subCategoryName);
    if (!calculation) {
      return;
    }

    if (['TB', 'TBD', 'MF'].includes(calculation && calculation.goalType)) {
      const percent = Math.round(parseFloat(calculation.get('goalPercentageComplete')));
      $(target).css(
        'background',
        `linear-gradient(
          to right,
          var(--tk-color-goal-fill) ${percent}%,
          var(--table_row_background) ${percent}%
        )`
      );
    } else {
      $(target).css('background', '');
    }
  }

  addMasterPacingProgress(target) {
    if (!isCurrentMonthSelected()) {
      $(target).css('background', '');
      return;
    }

    $(target).css(
      'background',
      this.generateProgressBarStyle(
        [
          'var(--table_header_background)',
          'var(--tk-color-progress-bar-month-indicator)',
          'var(--table_header_background)',
        ],
        [this.monthProgress - progressIndicatorWidth, this.monthProgress]
      )
    );
  }

  addPacingProgress(subCategory, target) {
    if (!isCurrentMonthSelected()) {
      $(target).css('background', '');
      return;
    }

    const pacingCalculation = pacingForCategory(subCategory);
    const balancePriorToSpending = subCategory.get('balancePriorToSpending');
    const { budgetedPace, monthPace } = pacingCalculation;

    // For pacing progress bars we can't use budgeted pace higher than 100%, otherwise the bars get screwed. So we cap it at 100% width
    const cappedBudgetedPace = Math.min(budgetedPace, 1);

    if (!pacingCalculation.isDeemphasized) {
      if (balancePriorToSpending > 0) {
        if (monthPace > budgetedPace) {
          $(target).css(
            'background',
            this.generateProgressBarStyle(
              [
                'var(--tk-color-pacing-fill)',
                'var(--table_row_background)',
                'var(--tk-color-progress-bar-month-indicator)',
                'var(--table_row_background)',
              ],
              [cappedBudgetedPace, this.monthProgress - progressIndicatorWidth, this.monthProgress]
            )
          );
        } else {
          $(target).css(
            'background',
            this.generateProgressBarStyle(
              [
                'var(--tk-color-pacing-fill)',
                'var(--tk-color-progress-bar-month-indicator)',
                'var(--tk-color-pacing-fill)',
                'var(--table_row_background)',
              ],
              [this.monthProgress - progressIndicatorWidth, this.monthProgress, cappedBudgetedPace]
            )
          );
        }
      } else {
        $(target).css(
          'background',
          this.generateProgressBarStyle(
            [
              'var(--table_row_background)',
              'var(--tk-color-progress-bar-month-indicator)',
              'var(--table_row_background)',
            ],
            [this.monthProgress - progressIndicatorWidth, this.monthProgress]
          )
        );
      }
    } else {
      $(target).css('background', '');
    }
  }

  invoke() {
    const today = ynab.utilities.DateWithoutTime.createForToday();
    this.monthProgress = today.getDate() / today.daysInMonth();

    let categories = $('.budget-table ul')
      .not('.budget-table-uncategorized-transactions')
      .not('.is-debt-payment-category');

    if (this.subCats === null || this.subCats.length === 0 || this.loadCategories) {
      this.subCats = getMergedCategories();
      this.loadCategories = false;
    }

    this.selMonth = getSelectedMonth().format('YYYY-MM');
    this.internalIdBase = 'mcbc/' + this.selMonth + '/';

    let masterCategoryName = '';
    $(categories).each((_, element) => {
      let nameCell;
      let budgetedCell;

      if ($(element).hasClass('is-master-category')) {
        const { category } = getEmberView(element.id);
        if (!category) {
          return;
        }

        masterCategoryName = category.displayName;
      }

      if ($(element).hasClass('is-sub-category')) {
        const subCategory = getEmberView(element.id, 'category');
        if (!subCategory) {
          return;
        }

        const namespacedCategory = `${masterCategoryName}_${subCategory.displayName}`;
        switch (this.settings.enabled) {
          case 'goals':
            $(element).addClass('goal-progress');
            this.addGoalProgress(namespacedCategory, $(element));
            break;
          case 'pacing':
            $(element).addClass('goal-progress');
            this.addPacingProgress(subCategory, $(element));
            break;
          case 'both':
            $(element).addClass('goal-progress-both');
            budgetedCell = $(element).find('li.budget-table-cell-budgeted')[0];
            nameCell = $(element).find('li.budget-table-cell-name')[0];
            this.addGoalProgress(namespacedCategory, budgetedCell);
            this.addPacingProgress(subCategory, nameCell);
            break;
        }
      }

      if ($(element).hasClass('is-master-category')) {
        switch (this.settings.enabled) {
          case 'pacing':
            this.addMasterPacingProgress($(element));
            break;
          case 'both':
            nameCell = $(element).find('li.budget-table-cell-name'); // [0];
            this.addMasterPacingProgress($(nameCell));
            break;
        }
      }
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }

    /**
     * Check for this node seperately from the other checks to ensure the flag to load
     * categories gets set just in case there is another changed node that drives invoke().
     */
    if (changedNodes.has('onboarding-steps')) {
      this.loadCategories = true;
    }

    if (
      changedNodes.has('budget-table-row') ||
      changedNodes.has('ynab-new-budget-available-number user-data') ||
      changedNodes.has('budget-table-cell-budgeted') ||
      changedNodes.has('navlink-budget active') ||
      changedNodes.has('budget-inspector')
    ) {
      this.invoke();
    } else if (
      changedNodes.has('modal-overlay ynab-u modal-popup modal-budget-edit-category active') ||
      changedNodes.has('modal-overlay ynab-u modal-popup modal-add-master-category active') ||
      changedNodes.has('modal-overlay ynab-u modal-popup modal-add-sub-category active')
    ) {
      /**
       * Seems there should be a more 'Embery' way to know when the categories have been
       * updated, added, or deleted but this'll have to do for now. Note that the flag is
       * set to true here so that next time invoke() is called the categories array will
       * be rebuilt. Rebuilding at this point won't work becuase the user hasn't completed
       * the update activity at this point.
       */
      this.loadCategories = true;
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.loadCategories = true;
      this.invoke();
    }
  }
}

function getMergedCategories() {
  const entityManager = getEntityManager();
  const masterCategories = entityManager.getAllNonTombstonedMasterCategories();
  const mergedCategories = [];

  masterCategories.forEach(masterCategory => {
    // Ignore certain categories!
    if (masterCategory.isHidden !== true && masterCategory.name !== 'Internal Master Category') {
      const subCategories = entityManager.getSubCategoriesByMasterCategoryId(
        masterCategory.getEntityId()
      );
      subCategories.forEach(subCategory => {
        // Ignore certain categories!
        if (
          subCategory.isHidden !== true &&
          !subCategory.isTombstone &&
          subCategory.name !== 'Uncategorized Transactions'
        ) {
          subCategory.toolkitName = masterCategory.name + '_' + subCategory.name; // Add toolkit specific attribute
          mergedCategories.push(subCategory);
        }
      });
    }
  });

  return mergedCategories;
}
