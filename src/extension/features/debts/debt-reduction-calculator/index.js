import { Feature } from 'toolkit/extension/features/feature';
// import { getEmberView } from 'toolkit/extension/utils/ember';
import { getSidebarViewModel } from 'toolkit/extension/utils/ynab';
// import { l10n } from 'toolkit/extension/utils/toolkit';

const YNAB_CONTENT_CONTAINER_SELECTOR = 'div.ynab-u.content';

export class DebtReductionCalculator extends Feature {
  closedAccounts = null;
  onBudgetAccounts = null;
  offBudgetAccounts = null;
  selectedAccounts = [];


  debtTools = [{
    name: 'Debt Snowball',
    toolkitId: 'toolSnowball'
  }, {
    name: 'Financial Calculator',
    toolkitId: 'toolCalc'
  }, {
    name: 'Enigmatic Financial Engine',
    toolkitId: 'toolEngine'
  }];

  injectCSS() { return require('./index.css'); }

  // willInvoke() {
  //   if (this.settings.enabled !== '0') {
  //     if (this.settings.enabled === '2') {
  //       // this.importClass += '-red';
  //     }
  //   }
  // }

  shouldInvoke() {
    return !this.isActive;
  }

  invoke = () => {
    // this.setUpDebtsButton();
    if ($('.ynabtk-navlink-debts.active').length) {
      this.showCalculator();
    }
  }

  observe() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  generateAccountSelect() {
    // let nonAccountOptions = ['all', 'onbudget', 'offbudget', 'custom'];

    // grab handles to the drop down and the list of selected accounts first
    let $select = $('#ynabtk-report-accounts');
    let $accountList = $('#selected-account-list');

    // clear both lists before generating the options
    $select.empty();
    $accountList.empty();

    $select.append('<option disabled value="custom">Select Specific Accounts...</option>');

    // based on the available account types for the report we're generating, add options
    // to the drop down. for 'all', add options to filter on on/off budget accounts as well
    /* switch (availableAccountTypes) {
      case 'onbudget':
        $select.append('<option value="onbudget">All Budget Accounts</option>');
        this.onBudgetAccounts.forEach((account) => {
          $select.append($('<option>', { value: account.get('entityId'), text: account.get('accountName') }));
        });
        break;
      case 'offbudget':
        $select.append('<option value="offbudget">All Tracking Accounts</option>');
        this.offBudgetAccounts.forEach((account) => {
          $select.append($('<option>', { value: account.get('entityId'), text: account.get('accountName') }));
        });
        break;
      case 'all':
      default:
        // $select.append('<option value="all">All Accounts</option>');
        // $select.append('<option value="onbudget">All Budget Accounts</option>');
        // $select.append('<option value="offbudget">All Tracking Accounts</option>');
        this.onBudgetAccounts.concat(offBudgetAccounts).forEach((account) => {
          $select.append($('<option>', { value: account.get('entityId'), text: account.get('accountName') }));
        });
        break;
    }
 */
    this.onBudgetAccounts.concat(this.offBudgetAccounts).forEach((account) => {
      $select.append($('<option>', { value: account.get('entityId'), text: account.get('accountName') }));
    });

    this.updateAccountList();
    // filterTransactionsAndBuildChart();
  }

  // this function updates the "chips" on the page every time the user changes the select
  updateAccountList() {
    let $select = $('#ynabtk-report-accounts');
    // remove them all first
    this.$accountList.empty();

    if (this.selectedAccounts.length === 0) {
      // if the selected accounts are empty and we didn't just click one of the "all" options
      // then go ahead and set the select to whatever our default for the report is.
      if (this.nonAccountOptions.indexOf($select.val()) === -1) {
        $select.val(this.availableAccountTypes);
      }
    } else {
      setTimeout(function () {
        $select.val('custom');
      }, 0);
    }

    // for each selected account, add a chip to the page when someone clicks the chip, it will get
    // removed from the list of chips. if they've clicked the last chip then the above code will default
    // us to whatever the default option of the report is
    this.selectedAccounts.forEach((accountId) => {
      let accountData = this.onBudgetAccounts.find((account) => accountId === account.get('entityId')) ||
      this.offBudgetAccounts.find((account) => accountId === account.get('entityId'));
      this.$accountList
        .append($('<div>', {
          class: 'ynabtk-chip',
          title: accountData.get('accountName'),
          text: accountData.get('accountName')
        })
          .click(() => {
            let index = this.selectedAccounts.indexOf(accountId);
            this.selectedAccounts.splice(index, 1);
            this.updateAccountList();
            this.filterTransactionsAndBuildChart();
          }));
    });
  }

  // updateAccountList();
  // }

  showCalculator() {
    console.log('showCalculator');

    // then grab the sidebar so we can get all the accounts...
    // const sideBarViewModel = ynabToolKit.shared.containerLookup('controller:application').get('sidebarViewModel');
    const sideBarViewModel = getSidebarViewModel();

    // store the accounts/transactions off on their own variables so we can use them later
    this.closedAccounts = sideBarViewModel.get('closedAccounts');
    this.onBudgetAccounts = sideBarViewModel.get('onBudgetAccounts').concat(this.closedAccounts.filter((account) => account.get('onBudget')));
    this.offBudgetAccounts = sideBarViewModel.get('offBudgetAccounts').concat(this.closedAccounts.filter((account) => !account.get('onBudget')));

    // clear out the content and put ours in there instead.
    this.buildResultsPage($(YNAB_CONTENT_CONTAINER_SELECTOR)); // , transactionsViewModel);
  }

  buildResultsPage($pane) { // , transactionsViewModel) {
    if ($('.ynabtk-debts').length) return;

    // this.updateNavigation();

    // append the entire page to the .scroll-wrap pane in YNAB (called by showReports)
    $pane.append($('<div class="ynabtk-debts"></div>')
      // append the navigation (list of supportedReports)
      .append(this.generatePageNavigation())
      // append the filters and containers for report headers/report data
      // .append($(`<div id="ynabtk-menubar" class="ember-view ynab-u reports-header"><button id="ynabtk-menubar-drc" class="active ember-view active">    Debt Reduction Calculator
      //             </button><button id="ynabtk-menubar-opt2" class="ember-view">    Net Worth
      //             </button><button id="ynabtk-menubar-opt3" class="ember-view">    Income v Expense</button></div>`)
      .append($('<div class="ynabtk-reports-filters"></div>')
        .append(`<h3>
                ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.filters']) || 'Debt Reduction Parameters')}
              </h3>
              <div class="ynabtk-filter-group date-filter">
                <span class="reports-filter-name timeframe">
                  ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.timeframe']) || 'Strategy')}:
                </span>
                <select class="ynabtk-filter-select ynabtk-quick-date-filters">
                  <option value="none" disabled selected>Select a Strategy...</option>
                </select>
                <div id="ynabtk-date-filter" class="ynabtk-date-filter-slider"></div>
              </div>
              <div class="ynabtk-filter-group">
                <span class="reports-filter-name">
                  ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.accounts']) || 'Accounts')}:
                </span>
                <select id="ynabtk-report-accounts" class="ynabtk-filter-select">
                  <option value="all">All Budget Accounts</option>
                </select>
                <div id="selected-account-list" class="ynabtk-account-chips"></div>
              </div>`))
      .append('<div class="ynabtk-reports-headers"></div>')
      .append('<div class="ynabtk-reports-data"></div>'));

    // generateDateSlider(transactionsViewModel);
    this.generateReductionStrategies();
  }

  generatePageNavigation() {
    // create the page header
    let $pageHeader = $(`<div class="ynabtk-reports-nav">
        <h2>
          <span><i class="flaticon stroke document-4"></i></span>
        </h2>
        <ul class="nav-reports"></ul>
      </div>`);

    // now populate the page header!
    this.debtTools.forEach((tool) => {
      $('.nav-reports', $pageHeader).append($('<li>', { class: 'nav-reports-navlink' }).append($('<a>', { id: tool.toolkitId, href: '#' }).text(tool.name).click(() => {
        this.onToolSelected(tool.toolkitId);
      })));
    });

    return $pageHeader;
  }

  generateReductionStrategies() {
    // const dateFilter = document.getElementById('ynabtk-date-filter');
    const reductionStrategies = [{
      name: 'Snowball',
      strategy: 'snowball'
    }, {
      name: 'Avalanche',
      strategy: 'avalance'
    }, {
      name: 'Order Entered',
      strategy: 'orderEntered'
    }, {
      name: 'No Snowball',
      strategy: 'noSnowball'
    }, {
      name: 'Custom - Highest First',
      strategy: 'customHighestFirst'
    }, {
      name: 'Custom - Lowest First',
      strategy: 'customLowestFirst'
    }];

    reductionStrategies.forEach((strategy, index) => {
      let disabled = false;

      $('.ynabtk-quick-date-filters')
        .append($('<option>', {
          value: index,
          disabled: disabled
        })
          .text(strategy.name));
    });

    $('.ynabtk-quick-date-filters').on('change', this, function (event) {
      let _this = event.data;
      let quickFilterIndex = parseInt($(this).val());
      // let quickFilterValue = reductionStrategies[quickFilterIndex].strategy;
      // dateFilter.noUiSlider.set(quickFilterValue);
      // dateFilter.set(quickFilterValue);
      // ynabToolKit.shared.setToolkitStorageKey('current-date-filter', quickFilterValue);
      _this.applyReductionStrategy(quickFilterIndex);
    });
  }

  applyReductionStrategy(strategy) {
    console.log('applyReductionStrategy:: strategy: ' + strategy);
    // return;
  }
}
