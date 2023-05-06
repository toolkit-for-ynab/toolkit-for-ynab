import React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import {
  getModalService,
  isCurrentRouteBudgetPage,
  isCurrentRouteReportPage,
} from 'toolkit/extension/utils/ynab';
import { componentAppend } from 'toolkit/extension/utils/react';
import CopyTransactionsButton from './CopyTransactionsButtons';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

export class CategoryActivityCopy extends Feature {
  shouldInvoke() {
    return (
      $('#tk-copy-transactions').length === 0 &&
      !!getModalService()?.isModalOpen &&
      !!document.querySelector('.modal-budget-activity')
    );
  }

  invoke() {
    const modal = document.querySelector('.modal-budget-activity');
    const modalService = getModalService();

    if (modal && modalService.isModalOpen) {
      let transactions: YNABTransaction[] | undefined = undefined;
      if (modalService.currentModal === 'modals/budget/activity' && isCurrentRouteBudgetPage()) {
        transactions = modalService.modalValue?.selectedActivityTransactions;
      } else if (
        modalService.currentModal === 'modals/reports/transactions' &&
        isCurrentRouteReportPage('any')
      ) {
        transactions = modalService.modalValue?.modalTransactions;
      }

      if (Array.isArray(transactions) && transactions.length > 0) {
        componentAppend(
          <CopyTransactionsButton transactions={transactions} />,
          modal.querySelector('.modal-actions')
        );
      }
    }
  }

  observe(nodes: Set<string>) {
    if (!this.shouldInvoke()) return;

    if (
      nodes.has('modal-overlay active  ynab-u modal-popup modal-budget-activity') ||
      nodes.has('modal-overlay active  pure-u modal-popup modal-budget-activity')
    ) {
      this.invoke();
    }
  }

  destroy() {
    $('#tk-copy-transactions').remove();
  }
}
