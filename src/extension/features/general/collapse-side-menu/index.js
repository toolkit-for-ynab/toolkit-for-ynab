import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, i10n, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class CollapseSideMenu extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() { return true; }

  invoke() {
    this.createCollapseButton();
    this.applyState();
  }

  observe(changedNodes) {
    if (changedNodes.has('nav-main')) {
      if (getToolkitStorageKey('isCollapsed')) {
        this.getHideElements().hide();
      }

      this.invoke();
    }
  }

  onRouteChanged() {
    if (getToolkitStorageKey('isCollapsed')) {
      this.getHideElements().hide();
    }

    this.invoke();
  }

  createCollapseButton() {
    if ($('.ynabtk-navlink-collapse').length) {
      return;
    }

    const button = $('<li>', {
      class: 'ember-view ynabtk-navlink-collapse'
    }).append($('<a>', {
      class: 'ynabtk-collapse-link'
    }).append($('<span>', {
      class: 'ember-view ynabtk-collapse-icon flaticon stroke left-circle-4'
    })).append(i10n('toolkit.collapse', 'Collapse'))).click(() => {
      const isCollapsed = getToolkitStorageKey('isCollapsed');
      setToolkitStorageKey('isCollapsed', !isCollapsed);
      this.applyState();
    });

    $('.nav-main').append(button);
    $('.ynabtk-collapse-link, .ynabtk-navlink-reports-link').addClass('collapsable');
  }

  applyState() {
    const isCollapsed = getToolkitStorageKey('isCollapsed');

    if (isCollapsed) {
      Promise.all([
        $('.ynab-u.sidebar').animate({ width: '3rem' }).promise(),
        $('.ynab-u.content').animate({ left: '3rem' }).promise(),
        $('.budget-header').animate({ left: '3rem' }).promise()
      ]).then(() => {
        $('.ynabtk-navlink-reports-link span').addClass('ynabtk-nav-link-collapsed');
        $('.ynabtk-collapse-link span').addClass('ynabtk-nav-link-collapsed');
        $('.ynabtk-collapse-icon').removeClass('left-circle-4').addClass('right-circle-4');
        this.getHideElements().hide();
      });
    } else {
      Promise.all([
        $('.ynab-u.sidebar').animate({ width: '260px' }).promise(),
        $('.ynab-u.content').animate({ left: '260px' }).promise(),
        $('.budget-header').animate({ left: '260px' }).promise()
      ]).then(() => {
        $('.ynabtk-navlink-reports-link span').removeClass('ynabtk-nav-link-collapsed');
        $('.ynabtk-collapse-link span').removeClass('ynabtk-nav-link-collapsed');
        $('.ynabtk-collapse-icon').removeClass('right-circle-4').addClass('left-circle-4');
        this.getHideElements().show();
      });
    }
  }

  getHideElements() {
    return $(`
      .button-prefs.button-prefs-budget,
      .nav-accounts,
      .button-sidebar.nav-add-account,
      .referral-program,
      .button-prefs.button-prefs-user
    `);
  }
}
