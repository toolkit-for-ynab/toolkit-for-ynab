import { Feature } from 'toolkit/extension/features/feature';

export class CalendarFirstDay extends Feature {
  observe(changedNodes) {
    if (!changedNodes.has('accounts-calendar')) return;

    this.adjustDays(document.querySelector('.accounts-calendar'));
  }

  adjustDays(element) {
    const shiftDays = parseInt(this.settings.enabled);
    for (let i = 0; i < shiftDays; i++) {
      let first = $('.accounts-calendar-weekdays', element).children().first();
      let last = $('.accounts-calendar-weekdays', element).children().last();
      first.insertAfter(last);
    }

    for (let i = 0; i < 7 - shiftDays; i++) {
      $('.accounts-calendar-grid', element).prepend($('<li class="accounts-calendar-empty"></li>'));
    }
  }
}
