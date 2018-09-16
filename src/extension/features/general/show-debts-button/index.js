import { Feature } from 'toolkit/extension/features/feature';
// import { getEmberView } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
// /* eslint-disable no-multi-str */
// const YNAB_CONTENT_CONTAINER_SELECTOR = 'div.ynab-u.content';
const YNAB_NATIVE_CONTENT_SELECTOR1 = 'div.scroll-wrap';
const YNAB_NATIVE_CONTENT_SELECTOR2 = 'div.register-flex-columns';

export class ShowDebtButton extends Feature {
  // injectCSS() { return require('./index.css'); }

  // willInvoke() {
  //   if (this.settings.enabled !== '0') {
  //     if (this.settings.enabled === '2') {
  //       // this.importClass += '-red';
  //     }
  //   }
  // }

  shouldInvoke() {
    return !this.isActive;
  }

  invoke = () => {
    this.setUpDebtsButton();
    // this.showDebtsPanel();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    // Did they switch budgets?
    if (changedNodes.has('layout user-logged-in')) {
      if ($('.nav-main').length) {
        this.invoke();
      }
    }

    // Did they switch away from our tab?
    if (changedNodes.has('navlink-budget active') ||
        changedNodes.has('navlink-debts active') ||
        changedNodes.has('navlink-accounts active') ||
        changedNodes.has('navlink-reports active') ||
        changedNodes.has('active navlink-reports') ||
        changedNodes.has('nav-account-row is-selected')) {
      // The user has left the Debts page.
      // We're no longer the active page.
      $('.ynabtk-navlink-debts').removeClass('active');

      $('.ynabtk-debts').remove();

      // And restore the YNAB stuff we hid earlier
      if ($(YNAB_NATIVE_CONTENT_SELECTOR1).length) {
        $(YNAB_NATIVE_CONTENT_SELECTOR1).show();
      } else {
        $(YNAB_NATIVE_CONTENT_SELECTOR2).show();
      }
    }

    // if YNAB overwrites the sidebar-contents just make sure the report button
    // doesn't get deleted. The second through the fourth checks are required
    // because the Toolkit reports <li> gets removed when the <li> for the native
    // YNAB links are updated. The CollapseSideMenu Toolkit feature relies on the
    // <li> so it needs to be added back if it's gone missing.
    if (changedNodes.has('nav-main') ||
        changedNodes.has('sidebar-contents') ||
        changedNodes.has('navlink-budget active') ||
        changedNodes.has('navlink-reports active') ||
        changedNodes.has('navlink-accounts active')) {
      this.setUpDebtsButton();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  // throw our reports button into the left-hand navigation pane so they can click it!
  setUpDebtsButton() {
    if ($('li.ynabtk-navlink-debts').length > 0) return;

    $('.nav-main > li:eq(0)')
      .after($('<li>', { class: 'ynabtk-navlink-debts' })
        .append($('<a>', { class: 'ynabtk-navlink-debts-link' })
          .append($('<span>', { class: 'ember-view flaticon stroke calculator' }))
          .append((ynabToolKit.l10nData && l10n['sidebar.debts']) || 'Debts')));

    $('.ynabtk-navlink-debts-link').click((event) => {
      event.preventDefault();
    });

    $('.ynabtk-navlink-debts').on('click', this, this.showDebtsPanel);
  }

  showDebtsPanel(event) {
    console.log('showDebtsPanel');
    let _this = event.data;

    _this.updateNavigation();

    if ($(YNAB_NATIVE_CONTENT_SELECTOR1).length) {
      $(YNAB_NATIVE_CONTENT_SELECTOR1).hide(); // budget, native reports, toolkit reports
    } else {
      $(YNAB_NATIVE_CONTENT_SELECTOR2).hide(); // all accounts, single account
    }

    ynabToolKit.invokeFeature('DebtReductionCalculator');
  }

  updateNavigation() {
    // remove the active class from all navigation items and add active to our guy
    $('.navlink-budget, .navlink-accounts, .navlink-reports').removeClass('active');
    $('.nav-account-row').removeClass('is-selected');
    $('.ynabtk-navlink-debts').addClass('active');

    $('.navlink-budget, .navlink-accounts, .nav-account-row').on('click', function () {
      // They're trying to navigate away.
      // Restore the highlight on whatever they're trying to click on.
      // For example, if they were on the Budget tab, then clicked on Reports, clicking on
      // Budget again wouldn't do anything as YNAB thinks they're already there. This switches
      // the correct classes back on and triggers our .observe().
      if ($(this).hasClass('navlink-budget') ||
          $(this).hasClass('navlink-accounts') ||
          $(this).hasClass('navlink-reports')) {
        $(this).addClass('active');
      } else if ($(this).hasClass('nav-account-row')) {
        $(this).addClass('is-selected');
      }
    });
  }
}
