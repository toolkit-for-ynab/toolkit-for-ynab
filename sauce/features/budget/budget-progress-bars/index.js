import { Feature } from 'toolkit/core/feature';
import { getCurrentRouteName, getEntityManager } from 'toolkit/helpers/toolkit';

export class BudgetProgressBars extends Feature {
  // Supporting functions, or variables, etc
  loadCategories = true;
  selMonth;
  subCats = [];
  internalIdBase;
  monthProgress;
  progressIndicatorWidth = 0.005; // Current month progress indicator width

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') > -1;
  }

  // Takes N colors and N-1 sorted points from (0, 1) to make color1|color2|color3 bg style.
  generateProgressBarStyle(colors, points) {
    points.unshift(0);
    points.push(1);
    let pointsPercent = Array.from(points, function (p) { return p * 100; });

    let style = 'linear-gradient(to right, ';
    for (let i = 0; i < colors.length; i++) {
      style += colors[i] + ' ' + pointsPercent[i] + '%, ';
      style += colors[i] + ' ' + pointsPercent[i + 1] + '%';
      style += (i + 1 === colors.length) ? ')' : ', ';
    }

    return style;
  }

  getCalculation(subCategoryName) {
    let subCat = this.subCats.find((ele) => { return ele.toolkitName === subCategoryName; });
    let calculation = null;
    if (subCat) {
      let crazyInternalId = this.internalIdBase + subCat.entityId;
      calculation = getEntityManager().getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
      /**
       * Add a few values from the subCat object to the calculation object.
       */
      calculation.targetBalance = subCat.getTargetBalance();
      calculation.goalType = subCat.getGoalType();
      calculation.goalCreationMonth = (subCat.goalCreationMonth) ? subCat.goalCreationMonth.toString().substr(0, 7) : '';
      /**
       * If the month the goal was created in is greater than the selected month, null the goal type to prevent further
       * processing.
       */
      if (calculation.goalCreationMonth && calculation.goalCreationMonth > this.selMonth) {
        calculation.goalType = null;
      }
    }

    return calculation;
  }

  addGoalProgress(subCategoryName, target) {
    let calculation = this.getCalculation(subCategoryName);

    let status = 0;
    let hasGoal = false;

    if (calculation !== null) {
      switch (calculation.goalType) {
        case 'TB' :
        case 'TBD' :
        case 'MF' :
          hasGoal = true;
          status = calculation.goalPercentageComplete;

          break;
        default:
      }
    }

    if (hasGoal) {
      let percent = Math.round(parseFloat(status));
      $(target).css('background', 'linear-gradient(to right, rgba(22, 163, 54, 0.3) ' + percent + '%, white ' + percent + '%)');
    } else {
      $(target).css('background', '');
    }
  }

  addPacingProgress(subCategoryName, target) {
    let deEmphasizedCategories = JSON.parse(localStorage.getItem('ynab_toolkit_pacing_deemphasized_categories')) || [];

    if (deEmphasizedCategories.indexOf(subCategoryName) === -1) {
      let calculation = this.getCalculation(subCategoryName);

      let budgeted = calculation.balance - calculation.budgetedCashOutflows - calculation.budgetedCreditOutflows;
      let available = calculation.balance;

      if (budgeted > 0) {
        let pacing = (budgeted - available) / budgeted;
        if (this.monthProgress > pacing) {
          $(target).css('background', this.generateProgressBarStyle(
              ['#c0e2e9', 'white', '#CFD5D8', 'white'],
              [pacing, this.monthProgress - this.progressIndicatorWidth, this.monthProgress])
          );
        } else {
          $(target).css('background', this.generateProgressBarStyle(
              ['#c0e2e9', '#CFD5D8', '#c0e2e9', 'white'],
              [this.monthProgress - this.progressIndicatorWidth, this.monthProgress, pacing])
          );
        }
      } else {
        $(target).css('background', this.generateProgressBarStyle(
            ['white', '#CFD5D8', 'white'],
            [this.monthProgress - this.progressIndicatorWidth, this.monthProgress])
        );
      }
    } else {
      $(target).css('background', '');
    }
  }

  invoke() {
    let _this = this;
    let date = new Date();
    this.monthProgress = new Date().getDate() / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    let categories = $('.budget-table ul').not('.budget-table-uncategorized-transactions').not('.is-debt-payment-category');
    let masterCategoryName = '';

    if (this.subCats === null || this.subCats.length === 0 || this.loadCategories) {
      this.subCats = ynabToolKit.shared.getMergedCategories();
      this.loadCategories = false;
    }

    this.selMonth = ynabToolKit.shared.parseSelectedMonth();

    // will be null on YNAB load when the user is not on the budget screen
    if (this.selMonth !== null) {
      this.selMonth = ynabToolKit.shared.yyyymm(this.selMonth);
      this.internalIdBase = 'mcbc/' + this.selMonth + '/';
    }

    $(categories).each(function () {
      let nameCell;
      let budgetedCell;
      if ($(this).hasClass('is-master-category')) {
        masterCategoryName = $(this).find('div.budget-table-cell-name-row-label-item>div>div[title]');
        masterCategoryName = (masterCategoryName !== 'undefined') ? ($(masterCategoryName).attr('title') + '_') : '';
      }

      if ($(this).hasClass('is-sub-category')) {
        let subCategoryName = $(this).find('li.budget-table-cell-name>div>div')[0].title.match(/.[^\n]*/);

        subCategoryName = masterCategoryName + subCategoryName;

        switch (_this.settings.enabled) {
          case 'goals':
            $(this).addClass('goal-progress');
            _this.addGoalProgress(subCategoryName, $(this));
            break;
          case 'pacing':
            $(this).addClass('goal-progress');
            _this.addPacingProgress(subCategoryName, $(this));
            break;
          case 'both':
            $(this).addClass('goal-progress-both');
            budgetedCell = $(this).find('li.budget-table-cell-budgeted')[0];
            nameCell = $(this).find('li.budget-table-cell-name')[0];
            _this.addGoalProgress(subCategoryName, budgetedCell);
            _this.addPacingProgress(subCategoryName, nameCell);
            break;
        }
      }

      if ($(this).hasClass('is-master-category')) {
        switch (_this.settings.enabled) {
          case 'pacing':
            $(this).css('background', _this.generateProgressBarStyle(
              ['#E5F5F9', '#CFD5D8', '#E5F5F9'],
              [_this.monthProgress - _this.progressIndicatorWidth, _this.monthProgress])
            );
            break;
          case 'both':
            nameCell = $(this).find('li.budget-table-cell-name');// [0];
            $(nameCell).css('background', _this.generateProgressBarStyle(
              ['#E5F5F9', '#CFD5D8', '#E5F5F9'],
              [_this.monthProgress - _this.progressIndicatorWidth, _this.monthProgress])
            );
            break;
        }
      }
    });
  }

  observe(changedNodes) {
    /**
     * Check for this node seperately from the other checks to ensure the flag to load
     * categories gets set just in case there is another changed node that drives invoke().
     */
    if (changedNodes.has('onboarding-steps')) {
      this.loadCategories = true;
    }

    if (changedNodes.has('budget-table-row') ||
        changedNodes.has('budget-table-cell-available-div user-data') ||
        changedNodes.has('budget-table-cell-budgeted') ||
        changedNodes.has('navlink-budget active') ||
        changedNodes.has('budget-inspector')) {
      this.invoke();
    } else if (changedNodes.has('modal-overlay ynab-u modal-popup modal-budget-edit-category active') ||
                changedNodes.has('modal-overlay ynab-u modal-popup modal-add-master-category active') ||
                changedNodes.has('modal-overlay ynab-u modal-popup modal-add-sub-category active')) {
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
