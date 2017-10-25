import { i10n } from '../../../helpers/toolkit';

const format = (...args) => (ynab.YNABSharedLib.currencyFormatter.format(...args));

const getDobEl = () => document.getElementsByClassName('days-of-buffering')[0];

const createDobEl = () => {
  const elementForDoB = document.getElementsByClassName('budget-header-days')[0]
                                .cloneNode(true);

  elementForDoB.className = elementForDoB.className + ' days-of-buffering';
  elementForDoB.children[1].textContent = i10n('budget.ageOfMoneyDays.DoB', 'Days of Buffering');
  elementForDoB.children[1].title = "Don't like AoM? Try this out instead!";

  document.getElementsByClassName('budget-header-flexbox')[0]
          .appendChild(elementForDoB);

  return elementForDoB;
};

const render = (
  { daysOfBuffering, totalOutflow, totalDays,
    avgDailyOutflow, avgDailyTransactions, ableToGenerate }
) => {
  const dobEl = getDobEl() || createDobEl();

  if (ableToGenerate) {
    const dayText = daysOfBuffering === 1.0 ?
                    i10n('budget.ageOfMoneyDays.one', 'day') :
                    i10n('budget.ageOfMoneyDays.other', 'days');

    dobEl.children[0].textContent = daysOfBuffering + ' ' + dayText;
    dobEl.children[0].title = `Total outflow: ${format(totalOutflow)}
Total days of budgeting: ${totalDays}
Average daily outflow: ~${format(avgDailyOutflow)}
Average daily transactions: ${avgDailyTransactions.toFixed(1)}`;
  } else {
    dobEl.children[0].textContent = '???';
    dobEl.children[0].title = 'Your budget history is less than 15 days. Go on with YNAB a while.';
  }
};

const shouldRender = (lastRenderTime, debounce = 1000) => {
  const timeHasCome = Date.now() - lastRenderTime >= debounce;
  const headerVisible = document.getElementsByClassName('budget-header').length > 0;

  return timeHasCome && headerVisible;
};

export { render, shouldRender };
