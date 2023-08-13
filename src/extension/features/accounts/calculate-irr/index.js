import { Feature } from 'toolkit/extension/features/feature';
import { getAccountsService, isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export class CalculateIRR extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    let { selectedAccount } = getAccountsService();
    return isCurrentRouteAccountsPage() && selectedAccount && !selectedAccount.onBudget;
  }

  invoke() {
    let { filters, selectedAccount, selectedAccountId } = getAccountsService();
    let { filterFrom, filterTo } = this._getFilterDates(filters);
    let totalIrr = this._calculateIRR(selectedAccountId);
    if (totalIrr === Infinity) {
      return this.destroy();
    }
    if (Number.isNaN(totalIrr)) {
      totalIrr = 'Error';
    } else {
      totalIrr = (100 * totalIrr).toFixed(2) + ' %';
    }
    let filteredIrr = '';
    let irrYear;
    if (filterFrom.getYear() === filterTo.getYear()) {
      filteredIrr = this._calculateIRR(selectedAccountId, {
        fromDate: filterFrom,
        toDate: filterTo,
      });
      if (filteredIrr === Infinity) irrYear = null;
      else irrYear = filterTo.getYear();
      if (Number.isNaN(filteredIrr)) {
        filteredIrr = 'Error';
      } else {
        filteredIrr = (100 * filteredIrr).toFixed(2) + ' %';
      }
    }
    let headerIrr = $(`.tk-accounts-header-irr`);
    let totalIrrContainer = $(`#tk-total-irr`);
    let filteredIrrContainer = $(`#tk-filtered-irr`);

    let textTotal = 'Total Annualized Return';
    let textFiltered = 'Annualized Return';
    if (selectedAccount.isOtherLiabilityAccount || selectedAccount.isMortgage) {
      textTotal = 'Estimated APR';
      textFiltered = 'Estimated APR';
    }

    if (!headerIrr || headerIrr.length === 0) {
      $('.accounts-header-balances').append(
        `<div class="tk-accounts-header-irr">
        <div class="tk-accounts-header-irr-div">
          <span id="tk-filtered-irr"></span>
          <div id="tk-accounts-header-filtered-irr-label"></div>
        </div>
        <div class="tk-accounts-header-irr-div">
          <span id="tk-total-irr"></span>
          <div id="tk-accounts-header-total-irr-label"></div>
        </div>
      </div>`
      );
    }

    totalIrrContainer.text(totalIrr);
    $(`#tk-accounts-header-total-irr-label`).text(textTotal);
    filteredIrrContainer.text(filteredIrr);
    $(`#tk-accounts-header-filtered-irr-label`).text(irrYear + ' ' + textFiltered);
    $(`#tk-accounts-header-filtered-irr-label`)
      .parent()
      .toggle(irrYear != null);
  }

  destroy() {
    let headerIrr = $(`.tk-accounts-header-irr`);
    if (headerIrr && headerIrr.length > 0) {
      headerIrr[0].parentElement.removeChild(headerIrr[0]);
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    } else {
      this.destroy();
    }
  }

  _calculateIRR = (accountId, options) => {
    const account = getEntityManager().getAccountById(accountId);
    const maxApproximationEpsilon = 1e-10;
    const iterMax = 50;
    let transactions = account.getTransactions();

    if (
      transactions.reduce((reduced, transaction) => {
        if (transaction.flag === this.settings.enabled && transaction.cleared !== 'Uncleared') {
          return reduced + transaction.amount;
        }
        return reduced;
      }, 0) === 0
    )
      return Infinity;

    var fromDate = transactions
      .reduce((date, transaction) => {
        if (transaction.date.isBefore(date)) return transaction.date;
        return date;
      }, transactions[0].date)
      .setDate(1)
      .setMonth(0);
    var toDate = transactions.reduce((date, transaction) => {
      if (transaction.date.isAfter(date)) return transaction.date;
      return date;
    }, transactions[0].date);

    if (options && options.fromDate && fromDate.isBefore(options.fromDate)) {
      fromDate = options.fromDate;
    }
    if (options && options.toDate && toDate.isAfter(options.toDate)) {
      toDate = options.toDate;
    }

    let startingValue = transactions.reduce((reduced, transaction) => {
      if (
        transaction.cleared !== 'Uncleared' &&
        !transaction.isTombstone &&
        transaction.date.isBefore(fromDate)
      ) {
        return reduced + transaction.amount;
      }
      return reduced;
    }, 0);

    let currentValue = transactions.reduce((reduced, transaction) => {
      if (
        transaction.cleared !== 'Uncleared' &&
        !transaction.isTombstone &&
        (transaction.date.isBefore(toDate) || transaction.date.equalsDateWithoutTime(toDate))
      ) {
        return reduced + transaction.amount;
      }
      return reduced;
    }, 0);

    let contributions = transactions.filter((trans) => {
      return (
        trans.flag === this.settings.enabled &&
        trans.cleared !== 'Uncleared' &&
        (trans.date.isAfter(fromDate) || trans.date.equalsDateWithoutTime(fromDate)) &&
        (trans.date.isBefore(toDate) || trans.date.equalsDateWithoutTime(toDate))
      );
    });

    var contributionsTotal = contributions.reduce((reduced, transaction) => {
      return reduced + transaction.amount;
    }, 0);
    var resultRate;
    var approximatedRate = contributionsTotal / currentValue;
    var npv;
    var iteration = 0;
    var continueLoop = true;
    var iterationLog = [];

    do {
      resultRate = approximatedRate;
      npv = this._npv({
        startingValue,
        fromDate,
        transaction: contributions,
        rate: resultRate,
        currentValue,
        toDate,
      });
      var npv1 = this._npvFirstDeriv({
        startingValue,
        fromDate,
        transaction: contributions,
        rate: resultRate,
        currentValue,
        toDate,
      });
      approximatedRate = resultRate - npv / npv1;
      continueLoop = Math.abs(approximatedRate - resultRate) > maxApproximationEpsilon;
      iterationLog.push({
        iteration,
        rate: resultRate,
        npv,
        npv1,
        approximatedRate,
        eps: Math.abs(approximatedRate - resultRate),
      });
    } while (continueLoop && ++iteration < iterMax);

    if (continueLoop) {
      return NaN;
    }

    return approximatedRate;
  };

  _npv = (inputs) => {
    let rate = inputs.rate + 1;
    let npv = inputs.currentValue / 1000;
    let currentDate = ynab.utilities.DateWithoutTime.createForToday();
    if (currentDate.isAfter(inputs.toDate)) currentDate = inputs.toDate;

    for (var i = 0; i < inputs.transaction.length; i++) {
      let yearFraction = inputs.transaction[i].date.daysApart(currentDate) / 365;
      npv -= (inputs.transaction[i].amount / 1000) * rate ** yearFraction;
    }
    let yearFraction = currentDate.daysApart(inputs.fromDate) / 365;
    npv -= (inputs.startingValue / 1000) * rate ** yearFraction;

    return npv;
  };

  _npvFirstDeriv = (inputs) => {
    let rate = inputs.rate + 1;
    let npv1 = 0;
    let currentDate = ynab.utilities.DateWithoutTime.createForToday();
    if (currentDate.isAfter(inputs.toDate)) currentDate = inputs.toDate;

    for (var i = 0; i < inputs.transaction.length; i++) {
      let yearFraction = inputs.transaction[i].date.daysApart(currentDate) / 365;
      npv1 -= yearFraction * (inputs.transaction[i].amount / 1000) * rate ** (yearFraction - 1);
    }
    let yearFraction = currentDate.daysApart(inputs.fromDate) / 365;
    npv1 -= yearFraction * (inputs.startingValue / 1000) * rate ** (yearFraction - 1);

    return npv1;
  };

  _getFilterDates = (filter) => {
    var filterFrom = ynab.utilities.DateWithoutTime.createFromYearMonthDate(
      filter.fromYear,
      filter.fromMonth,
      1
    );
    var filterTo = ynab.utilities.DateWithoutTime.createFromYearMonthDate(
      filter.toYear,
      filter.toMonth,
      15
    ).endOfMonth();

    return { filterFrom, filterTo };
  };
}
