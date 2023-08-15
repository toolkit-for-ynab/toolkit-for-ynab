import { l10n } from 'toolkit/extension/utils/toolkit';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Collections } from 'toolkit/extension/utils/collections';
import moment from 'moment';

export class DaysOfBuffering extends Feature {
  get lookbackDays() {
    return (parseInt(this.settings.enabled) || 0) * 30;
  }

  injectCSS() {
    return require('./index.css');
  }

  destroy() {
    document.querySelector('.tk-days-of-buffering')?.remove();
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    const eligibleTransactions = getEntityManager()
      .getAllTransactions()
      .filter(this._eligibleTransactionFilter);
    let onBudgetAccounts = Collections.accountsCollection.getOnBudgetAccounts();

    let onBudgetBalance = 0;
    if (onBudgetAccounts) {
      // filter credit card accounts if enabled option is '2'
      if (ynabToolKit.options.DaysOfBufferingExcludeCreditCards) {
        onBudgetAccounts = onBudgetAccounts.filter((acc) => acc.accountType !== 'CreditCard');
      }

      onBudgetBalance = onBudgetAccounts.reduce((reduced, { accountCalculation }) => {
        if (accountCalculation && !accountCalculation.isTombstone) {
          reduced += accountCalculation.balance;
        }

        return reduced;
      }, 0);
    }

    const calculation = this._calculateDaysOfBuffering(onBudgetBalance, eligibleTransactions);
    this._updateDisplay(calculation);
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  _updateDisplay(calculation) {
    const { averageDailyOutflow, daysOfBuffering, availableDates, totalOutflow } = calculation;
    const daysOfBufferingContainer = document.querySelector('.tk-days-of-buffering');
    let $displayElement = $(daysOfBufferingContainer);
    if (!daysOfBufferingContainer) {
      $displayElement = $('<div>', {
        class: 'budget-header-item budget-header-days tk-days-of-buffering',
      }).append(
        $('<div>')
          .append(
            $('<div>', {
              class: 'budget-header-days-age',
              title: l10n('toolkit.dob.tooltip', "Don't like AoM? Try this out instead!"),
            })
          )
          .append(
            $('<div>', {
              class: 'budget-header-days-label',
              text: l10n('toolkit.dob.title', 'Days of Buffering'),
              title: l10n('toolkit.dob.tooltip', "Don't like AoM? Try this out instead!"),
            })
          )
      );

      $('.budget-header-flexbox').append($displayElement);
    }

    let text = '???';
    let title = l10n(
      'toolkit.dob.noHistory',
      'Your budget history is less than 15 days. Go on with YNAB a while.'
    );

    if (!calculation.notEnoughDates) {
      const dayText =
        daysOfBuffering === 1.0
          ? l10n('budget.ageOfMoneyDays.one', 'day')
          : l10n('budget.ageOfMoneyDays.other', 'days');
      text = `${daysOfBuffering} ${dayText}`;

      title = `${l10n('toolkit.dob.outflow', 'Total outflow')}: ${formatCurrency(totalOutflow)}`;
      title += `\n${l10n('toolkit.dob.days', 'Total days of budgeting')}: ${availableDates}`;
      title += `\n${l10n('toolkit.dob.avgOutflow', 'Average daily outflow')}: ~${formatCurrency(
        averageDailyOutflow
      )}`;

      const dateOfBuffering = this._getDateOfBuffering(daysOfBuffering);
      title += `\n${l10n('toolkit.dob.dateOfBuffering', 'Date of buffering')}: ${dateOfBuffering}`;
    }

    $('.budget-header-days-age', $displayElement).text(text);
    $('.budget-header-days-age', $displayElement).attr('title', title);
  }

  /**
   * Days of buffering is calculated by taking the total outflows within the selected window and
   * dividing it by the number of days in the selected window. The selected window comes from
   * the DaysOfBufferingHistoryLookup option and is represented in months. We estimate days to
   * be (number of months * 30). If the user selected "all history", the divisor is simply the
   * number of days since the first eligible transaction. If there are not at least 15 unique
   * days within the window that have an eligible transaction, we consider the metric unable to
   * be calculated.
   */
  _calculateDaysOfBuffering = (balance, transactions) => {
    const { dates, totalOutflow, uniqueDates } = transactions.reduce(
      (reduced, current) => {
        const { amount, date } = current;
        reduced.dates.push(date.toUTCMoment());
        reduced.uniqueDates.set(date.format());
        reduced.totalOutflow += amount;
        return reduced;
      },
      { dates: [], totalOutflow: 0, uniqueDates: new Map() }
    );

    const minDate = moment.min(dates);
    const maxDate = moment.max(dates);
    const availableDates =
      this.lookbackDays !== 0
        ? Math.min(this.lookbackDays, maxDate.diff(minDate, 'days'))
        : maxDate.diff(minDate, 'days');

    let averageDailyOutflow = Math.abs(totalOutflow / availableDates);

    let daysOfBuffering = balance / averageDailyOutflow;
    if (daysOfBuffering < 10) {
      daysOfBuffering = daysOfBuffering.toFixed(1);
    } else {
      daysOfBuffering = Math.floor(daysOfBuffering);
    }

    const notEnoughDates = uniqueDates.size < 15;
    if (notEnoughDates) {
      daysOfBuffering = null;
    }

    return {
      averageDailyOutflow,
      daysOfBuffering,
      notEnoughDates,
      availableDates,
      totalOutflow,
    };
  };

  _eligibleTransactionFilter = (transaction) => {
    const today = ynab.utilities.DateWithoutTime.createForToday();

    let isEligibleDate = false;
    if (this.lookbackDays === 0) {
      isEligibleDate = true;
    } else {
      isEligibleDate = transaction.date.daysApart(today) < this.lookbackDays;
    }

    return (
      isEligibleDate &&
      !transaction.isTombstone &&
      !transaction.payee?.isInternal &&
      !transaction.isTransferTransaction() &&
      transaction.account.onBudget &&
      transaction.amount < 0 &&
      transaction.accepted
    );
  };

  /**
   * #1745 - Display the date of buffering
   *
   * Date of Buffering is calculated from todays date + days of buffering
   */
  _getDateOfBuffering(daysOfBuffering) {
    // Calculate the Date Of Buffering by adding Days Of Buffering to today's date
    const today = ynab.utilities.DateWithoutTime.createForToday();
    const dateOfBuffering = today.addDays(daysOfBuffering);

    // Apply the user's date format
    return ynab.formatDate(dateOfBuffering.format());
  }
}
