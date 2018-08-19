import { Feature } from 'toolkit/extension/features/feature';
// import { getEmberView } from 'toolkit/extension/utils/ember';
import { getSidebarViewModel } from 'toolkit/extension/utils/ynab';
// import { l10n } from 'toolkit/extension/utils/toolkit';

const YNAB_CONTENT_CONTAINER_SELECTOR = 'div.ynab-u.content';

export class DebtReductionCalculator extends Feature {
  closedAccounts = null;
  onBudgetAccounts = null;
  offBudgetAccounts = null;

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
      // .append(generateReportNavigation())
      // append the filters and containers for report headers/report data
      .append($('<div class="ynabtk-reports-filters"></div>')
        .append(`<h3>
                ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.filters']) || 'Filters')}
              </h3>
              <div class="ynabtk-filter-group date-filter">
                <span class="reports-filter-name timeframe">
                  ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.timeframe']) || 'Timeframe')}:
                </span>
                <select class="ynabtk-filter-select ynabtk-quick-date-filters">
                  <option value="none" disabled selected>Quick Filter...</option>
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
    // generateQuickDateFilters();
  }
}
