import { Feature } from 'toolkit/extension/features/feature';

export class CalendarFirstDay extends Feature {
  // Variables for tracking specific states
  isCalendarOpen = false;

  isReRendering = false;

  injectCSS() {
    return require('./index.css');
  }

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
    let $originalAccountsCalendarGrid = $(
      '.accounts-calendar-grid:not(.accounts-calendar-grid--toolkit-calendar-first-day-managed)'
    );

    // Remove all previously added shift elements
    $originalAccountsCalendarGrid.find('.shift').remove();

    if ($('.accounts-calendar-empty', $originalAccountsCalendarGrid).length >= shiftDays) {
      // Remove specific # of empty elements
      $('.accounts-calendar-empty', $originalAccountsCalendarGrid)
        .slice(-shiftDays)
        .remove();
    } else {
      // Add 'shift' empty elements
      for (var j = 0; j < 7 - shiftDays; j++) {
        $originalAccountsCalendarGrid.prepend(
          '<li class="accounts-calendar-empty shift">&nbsp;</li>'
        );
      }
    }

    // Duplication of calendar days to Toolkit managed area is necessary
    // to avoid ugly re-styling flash/jumping numbers when selecting date
    // which doesn't auto-close the calendar modal
    if ($('.accounts-calendar-grid--toolkit-calendar-first-day-managed').length === 0) {
      $originalAccountsCalendarGrid.after(
        '<ul class="accounts-calendar-grid accounts-calendar-grid--toolkit-calendar-first-day-managed"></ul>'
      );
    }

    let $managedAccountsCalendarGrid = $(
      '.accounts-calendar-grid--toolkit-calendar-first-day-managed'
    );
    $managedAccountsCalendarGrid.html($originalAccountsCalendarGrid.html());
  }

  shiftDays() {
    return Number(this.settings.enabled);
  }

  observe(changedNodes) {
    if (
      changedNodes.has('modal-overlay active  modal-account-calendar js-ynab-new-calendar-overlay')
    ) {
      this.isCalendarOpen = true;
      this.reRenderHeader();
    } else if (
      changedNodes.has(
        'modal-overlay active  modal-account-calendar js-ynab-new-calendar-overlay closing'
      )
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
