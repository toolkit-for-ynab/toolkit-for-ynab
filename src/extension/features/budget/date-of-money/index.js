import { Feature } from 'toolkit/extension/features/feature';

const REFLECT_AOM_SELECTORS = [
  '[data-testid="age-of-money-days"]',
  '[data-testid="ageOfMoneyDays"]',
  '.age-of-money-days',
  '[class*="ageOfMoney"] [class*="days"]',
  '[class*="age-of-money"] [class*="days"]',
];

export class DateOfMoneyTooltip extends Feature {
  shouldInvoke() {
    return (
      document.location.hash.includes('reflect') ||
      document.location.pathname.includes('/reflect')
    );
  }

  invoke() {
    const ageElement = this._findAomElement();
    if (!ageElement || ageElement.getAttribute('data-toolkit-dom') === 'date-of-money') {
      return;
    }

    const days = parseInt(ageElement.textContent.trim(), 10);
    if (isNaN(days) || days <= 0) return;

    const earnedDate = new Date();
    earnedDate.setDate(earnedDate.getDate() - days);

    const dateString = earnedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    ageElement.setAttribute('title', `Money earned around: ${dateString}`);
    ageElement.setAt
