import { Feature } from 'toolkit/extension/features/feature';

// const TOOLKIT_FIRST_MONTHS_TRANSACTION_CLASS = 'tk-first-months-transaction';

export class SeparateCurrentMonthsTransactions extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    // const transactionDatesCollection = document.getElementsByClassName(
    //   'ynab-grid-cell ynab-grid-cell-date user-data'
    // );
    // const currentMonth = new Date(Date.now()).getMonth();
    // const currentYear = new Date(Date.now()).getFullYear();
    // const transactionDates = [...transactionDatesCollection];
    // const firstNodeDate = transactionDates.find((node) => {
    //   let transactionDate = new Date(node.textContent.trim());
    //   if (
    //     currentMonth !== transactionDate.getMonth() ||
    //     currentYear !== transactionDate.getFullYear()
    //   ) {
    //     return true;
    //   }
    // });
    // try {
    //   firstNodeDate.classList.add('test');
    // } finally {
    //   console.log('catch');
    // }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-cell ynab-grid-cell-date user-data')) {
      this.invoke();
    }
  }
}
