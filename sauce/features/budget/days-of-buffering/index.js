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
    if (!shouldRender(this.lastRenderTime) || !this.shouldInvoke()) return;

    const transactions = this.entityManager.getAllTransactions().filter(this.transactionFilter);
    const report = generateReport(transactions, this.accountBalance);

    this.render(report);
  }

  shouldInvoke() {
    return !(document.getElementsByClassName('budget-header-days')[0].classList.contains('budget-header-no-days'));
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
