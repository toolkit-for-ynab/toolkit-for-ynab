import { Feature } from 'toolkit/extension/features/feature';

export class CalendarFirstDay extends Feature {
  // Variables for tracking specific states
  isCalendarOpen = false;
  isReRendering = false;

  shouldInvoke() {
    return false;
  }

  reRenderHeader() {
    let shiftDays = this.shiftDays();
    // Shift the header items by number of days (only needs to happen once)
    for (var i = 0; i < shiftDays; i++) {
      let first = $('.accounts-calendar-weekdays')
        .children()
        .first();
      let last = $('.accounts-calendar-weekdays')
        .children()
        .last();
      first.insertAfter(last);
    }
    this.reRenderWeekdays();
  }

  reRenderWeekdays() {
    let shiftDays = this.shiftDays();

    // Remove all previously added shift elements
    $('.accounts-calendar-grid')
      .find('.shift')
      .remove();

    if ($('.accounts-calendar-empty').length >= shiftDays) {
      // Remove specific # of empty elements
      $('.accounts-calendar-empty')
        .slice(-shiftDays)
        .remove();
    } else {
      // Add 'shift' empty elements
      for (var j = 0; j < 7 - shiftDays; j++) {
        $('.accounts-calendar-grid').prepend(
          '<li class="accounts-calendar-empty shift">&nbsp;</li>'
        );
      }
    }
  }

  shiftDays() {
    return Number(this.settings.enabled);
  }

  observe(changedNodes) {
    if (
      changedNodes.has(
        'ynab-u modal-account-calendar modal-account-dropdown ember-view modal-overlay active'
      ) ||
      changedNodes.has('ynab-u modal-account-calendar ember-view modal-overlay active')
    ) {
      this.isCalendarOpen = true;
      this.reRenderHeader();
    } else if (
      changedNodes.has('ynab-u modal-account-calendar ember-view modal-overlay active closing')
    ) {
      this.isCalendarOpen = false;
    } else if (
      changedNodes.has('accounts-calendar-grid') &&
      !changedNodes.has('accounts-calendar-weekdays') &&
      this.isCalendarOpen &&
      !this.isReRendering
    ) {
      this.isReRendering = true;
      this.reRenderWeekdays();
    } else if (this.isReRendering) {
      // It's now safe to start listening for changes on the calendar node
      this.isReRendering = false;
    }
  }
}
