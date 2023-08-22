import { Feature } from 'toolkit/extension/features/feature';

// const TOOLKIT_FIRST_MONTHS_TRANSACTION_CLASS = 'tk-first-months-transaction';

export class SeparateCurrentMonthsTransactions extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    const transaction = this.findPreviousMonthsTransaction();
    transaction.classList.add('currentMonthSeparator');
    console.log(this.isDateSorted() ? 'not sorted' : 'sorted');
  }

  injectCSS() {
    return require('./index.css');
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-cell ynab-grid-cell-date user-data')) {
      this.invoke();
    }
  }

  isDateSorted() {
    const dateHeadersCollection = document.getElementsByClassName(
      'ynab-grid-header-cell js-ynab-grid-header-cell ynab-grid-cell-date'
    );

    const dateHeader = [...dateHeadersCollection][0];
    return !dateHeader.classList.contains('is-sorting');
  }

  findPreviousMonthsTransaction() {
    const transactionDatesCollection = document.getElementsByClassName(
      'ynab-grid-cell ynab-grid-cell-date user-data'
    );

    const currentMonth = new Date(Date.now()).getMonth();
    const currentYear = new Date(Date.now()).getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentYear;

    const transactionDates = [...transactionDatesCollection];

    const previousMonthsTransactions = transactionDates.filter((transaction) => {
      let transactionDate = new Date(transaction.textContent.trim());
      return (
        previousMonth === transactionDate.getMonth() &&
        previousYear === transactionDate.getFullYear()
      );
    });

    previousMonthsTransactions.sort((a, b) => {
      let transactionADate = new Date(a.textContent.trim());
      let transactionBDate = new Date(b.textContent.trim());
      return transactionBDate.getDate() - transactionADate.getDate();
    });

    const previousMonthsTransaction = previousMonthsTransactions[0];

    return previousMonthsTransaction.parentElement;
  }
}
