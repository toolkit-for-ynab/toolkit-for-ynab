import * as toolkitHelper from 'toolkit/helpers/toolkit';

import { Feature } from 'toolkit/core/feature';
import { getEntityManager } from 'toolkit/helpers/toolkit';

import outflowTransactionsFilter from './outflowTransactionsFilter';
import generateReport from './generateReport';
import { render, shouldRender } from './render';

export class DaysOfBuffering extends Feature {
  injectCSS() { return require('./index.css'); }

  constructor() {
    super();
    this.historyLookup = parseInt(ynabToolKit.options.DaysOfBufferingHistoryLookup);
    this.transactionFilter = outflowTransactionsFilter(this.historyLookup);
    this.lastRenderTime = 0;
    this.observe = this.invoke;
  }

  invoke() {
    if (!this.shouldInvoke() || !shouldRender(this.lastRenderTime)) return;

    const transactions = this.entityManager.getAllTransactions().filter(this.transactionFilter);
    const report = generateReport(transactions, this.accountBalance);

    this.render(report);
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') > -1;
  }

  render(report) {
    render(report);
    this.lastRenderTime = Date.now();
  }

  get entityManager() {
    return getEntityManager();
  }

  get accountBalance() {
    return ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel()._result.getOnBudgetAccountsBalance();
  }
}
