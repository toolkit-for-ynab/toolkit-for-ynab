import { i10n } from 'toolkit/extension/utils/toolkit';

const format = (...args) => (ynab.YNABSharedLib.currencyFormatter.format(...args));

const getDobEl = () => document.getElementsByClassName('days-of-buffering')[0];

const createDobEl = () => {
  const label = i10n('budget.dob.title', 'Days of Buffering');
  const labelTooltip = i10n('budget.dob.tooltip', 'Don\'t like AoM? Try this out instead!');
  const elementForDoB = $('<div>', { class: 'budget-header-item budget-header-days days-of-buffering' })
    .append($('<div>', { class: 'budget-header-days-age' }))
    .append($('<div>', { class: 'budget-header-days-label' }).text(label).prop('title', labelTooltip))[0];

  document.getElementsByClassName('budget-header-flexbox')[0]
    .appendChild(elementForDoB);

  return elementForDoB;
};

const render = ({
  daysOfBuffering, totalOutflow, totalDays,
  avgDailyOutflow, avgDailyTransactions, ableToGenerate
}) => {
  const dobEl = getDobEl() || createDobEl();

  if (ableToGenerate) {
    const dayText = daysOfBuffering === 1.0 ?
      i10n('budget.ageOfMoneyDays.one', 'day') :
      i10n('budget.ageOfMoneyDays.other', 'days');

    dobEl.children[0].textContent = daysOfBuffering + ' ' + dayText;
    dobEl.children[0].title = `${i10n('budget.dob.outflow', 'Total outflow')}: ${format(totalOutflow)}
${i10n('budget.dob.days', 'Total days of budgeting')}: ${totalDays}
${i10n('budget.dob.avgOutflow', 'Average daily outflow')}: ~${format(avgDailyOutflow)}
${i10n('budget.dob.avgTransactions', 'Average daily transactions')}: ${avgDailyTransactions.toFixed(1)}`;
  } else {
    dobEl.children[0].textContent = i10n('budget.ageOfMoneyNotAvailable', '???');
    dobEl.children[0].title = i10n('budget.dob.noHistory', 'Your budget history is less than 15 days. Go on with YNAB a while.');
  }
};

const shouldRender = (lastRenderTime, debounce = 1000) => {
  const timeHasCome = Date.now() - lastRenderTime >= debounce;
  const headerVisible = document.getElementsByClassName('budget-header').length > 0;

  return timeHasCome && headerVisible;
};

export { render, shouldRender };
