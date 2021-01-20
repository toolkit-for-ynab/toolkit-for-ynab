import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export class CalculateIRR extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    let { selectedAccount, selectedAccountId } = controllerLookup('accounts');
    return selectedAccountId && isCurrentRouteAccountsPage() && !selectedAccount.onBudget;
  }

  invoke() {
    this._flagColor = ynabToolKit.options.CalculateIRRflagColor;
    let { selectedAccountId, filters } = controllerLookup('accounts');
    let { filterFrom, filterTo } = this._getFilterDates(filters);
    let totalIrr = (100 * this._calculateIRR(selectedAccountId)).toFixed(2) + ' %';
    if (filterFrom.getYear() === filterTo.getYear()) {
      var filteredIrr =
        (
          100 * this._calculateIRR(selectedAccountId, { fromDate: filterFrom, toDate: filterTo })
        ).toFixed(2) + ' %';
      var irrYear = filterTo.getYear();
    } else {
      var irrYear = null;
    }
    let headerIrr = $(`.tk-accounts-header-irr`);
    let totalIrrContainer = $(`#tk-total-irr`);
    let filteredIrrContainer = $(`#tk-filtered-irr`);
    if (!headerIrr || headerIrr.length === 0) {
      $('.accounts-header-balances').append(
        `<div class="tk-accounts-header-irr">
        <div class="tk-accounts-header-irr-div">
          <span id="tk-filtered-irr">${filteredIrr}</span>
          <div id="tk-accounts-header-filtered-irr-label">${irrYear} Annualized Return</div>
        </div>
        <div class="tk-accounts-header-irr-div">
          <span id="tk-total-irr">${totalIrr}</span>
          <div id="tk-accounts-header-total-irr-label">Total Annualized Return</div>
        </div>
      </div>`
      );
    }

    totalIrrContainer.text(totalIrr);
    filteredIrrContainer.text(filteredIrr);
    $(`#tk-accounts-header-filtered-irr-label`).text(irrYear + ' Annualized Return');
    $(`#tk-accounts-header-filtered-irr-label`)
      .parent()
      .toggle(irrYear != null ? true : false);
    this._setFeatureVisibility(true);
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
      this._setFeatureVisibility(false);
    }
  }

  _calculateIRR = (accountId, options) => {
    const account = getEntityManager().getAccountById(accountId);
    const epsMax = 1e-10;
    const iterMax = 50;
    let transactions = account.getTransactions();

    if (
      transactions.reduce((reduced, transaction) => {
        if (transaction.flag === this._flagColor && transaction.cleared !== 'Uncleared') {
          return reduced + transaction.amount;
        }
        return reduced;
      }, 0) === 0
    )
      return Infinity;

    var fromDate = transactions
      .reduce((date, transaction) => {
        if (transaction.date.isBefore(date)) return transaction.date;
        else return date;
      }, transactions[0].date)
      .setDate(1)
      .setMonth(0);
    var toDate = transactions.reduce((date, transaction) => {
      if (transaction.date.isAfter(date)) return transaction.date;
      else return date;
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

    let contributions = transactions.filter(trans => {
      return (
        trans.flag === this._flagColor &&
        trans.cleared !== 'Uncleared' &&
        (trans.date.isAfter(fromDate) || trans.date.equalsDateWithoutTime(fromDate)) &&
        (trans.date.isBefore(toDate) || trans.date.equalsDateWithoutTime(toDate))
      );
    });

    var resultRate = 0.1;
    var newRate;
    var epsRate;
    var resultValue;
    var iteration = 0;
    var contLoop = true;
    do {
      resultValue = this._irrResult({
        startingValue,
        fromDate,
        transaction: contributions,
        rate: resultRate,
        currentValue,
        toDate,
      });
      var deriv = this._irrFirstDeriv({
        startingValue,
        fromDate,
        transaction: contributions,
        rate: resultRate,
        currentValue,
        toDate,
      });
      newRate = resultRate - resultValue / deriv;
      epsRate = Math.abs(newRate - resultRate);
      resultRate = newRate;
      contLoop = epsRate > epsMax && Math.abs(resultValue) > epsMax;
    } while (contLoop && ++iteration < iterMax);

    if (contLoop) {
      console.log('Max Iterations Exceeded');
      return NaN;
    }

    return resultRate;
  };

  _irrResult = ob => {
    let rate = ob.rate + 1;
    let result = ob.startingValue / 1000;
    let currentDate = ynab.utilities.DateWithoutTime.createForToday();
    if (currentDate.isAfter(ob.toDate)) currentDate = ob.toDate;

    for (var i = 0; i < ob.transaction.length; i++) {
      let frac = ob.transaction[i].date.daysApart(ob.fromDate) / 365;
      result += ob.transaction[i].amount / 1000 / Math.pow(rate, frac);
    }
    let frac = currentDate.daysApart(ob.fromDate) / 365;
    result += -ob.currentValue / 1000 / Math.pow(rate, frac);

    return result;
  };

  _irrFirstDeriv = ob => {
    let rate = ob.rate + 1;
    let result = 0;
    let currentDate = ynab.utilities.DateWithoutTime.createForToday();
    if (currentDate.isAfter(ob.toDate)) currentDate = ob.toDate;

    for (var i = 0; i < ob.transaction.length; i++) {
      let frac = ob.transaction[i].date.daysApart(ob.fromDate) / 365;
      result -= (frac * (ob.transaction[i].amount / 1000)) / Math.pow(rate, frac + 1);
    }
    let frac = currentDate.daysApart(ob.fromDate) / 365;
    result -= (frac * (-ob.currentValue / 1000)) / Math.pow(rate, frac + 1);

    return result;
  };

  _getFilterDates = filter => {
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

  _setFeatureVisibility = visible => {
    let featureContainer = $('.tk-accounts-header-irr');
    if (featureContainer && featureContainer.length) {
      featureContainer.toggle(visible);
    }
  };
}
