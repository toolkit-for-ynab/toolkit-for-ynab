import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';
import { getToolkitStorageKey, l10n, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const SIDEBAR_COLLAPSED_SIZE = '4.6rem';

export class CollapseSideMenu extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return getCurrentRouteName() !== 'users.budgets';
  }

  invoke() {
    this.createCollapseButton();
    this.applyState();
  }

  observe(changedNodes) {
    if (changedNodes.has('nav-main')) {
      if (getToolkitStorageKey('isCollapsed')) {
        this.getHideElements().hide();
        this.getNavLinkItems().addClass('tk-navlink-width');
      }

      this.invoke();
    }
  }

  onRouteChanged() {
    if (getToolkitStorageKey('isCollapsed')) {
      this.getHideElements().hide();
      this.getNavLinkItems().addClass('tk-navlink-width');
    }

    this.invoke();
  }

  createCollapseButton() {
    if ($('.ynabtk-navlink-collapse').length) {
      return;
    }

    const button = $('<li>', {
      class: 'ember-view ynabtk-navlink-collapse',
    })
      .append(
        $('<a>', {
          class: 'tk-navlink',
        })
          .append(
            $('<i>', {
              class: 'ynabtk-collapse-icon flaticon stroke left-circle-4',
            })
          )
          .append(
            $('<span>', {
              class: 'tk-collapse-toggle-text',
              text: getToolkitStorageKey('isCollapsed', false)
                ? l10n('toolkit.expand', 'Expand')
                : l10n('toolkit.collapse', 'Collapse'),
            })
          )
      )
      .click(() => {
        const isCollapsed = getToolkitStorageKey('isCollapsed');
        setToolkitStorageKey('isCollapsed', !isCollapsed);
        this.applyState();
      });

    $('.nav-main').append(button);
    $('.ynabtk-collapse-link, .ynabtk-navlink-reports-link');
  }

  applyState() {
    const isCollapsed = getToolkitStorageKey('isCollapsed');

    if (isCollapsed) {
      Promise.all([
        $('.ynab-u.sidebar')
          .animate({ width: `${SIDEBAR_COLLAPSED_SIZE}` })
          .promise(),
        $('.ynab-u.content')
          .animate({ left: `${SIDEBAR_COLLAPSED_SIZE}` })
          .promise(),
        $('.budget-header')
          .animate({ left: `${SIDEBAR_COLLAPSED_SIZE}` })
          .promise(),
      ]).then(() => {
        $('.layout.user-logged-in').addClass('collapsed');
        $('.ynabtk-navlink-reports-link span').addClass('ynabtk-nav-link-collapsed');
        $('.ynabtk-collapse-link span').addClass('ynabtk-nav-link-collapsed');
        $('.ynabtk-collapse-icon')
          .removeClass('left-circle-4')
          .addClass('right-circle-4');
        this.getHideElements().hide();
        this.getNavLinkItems().addClass('tk-navlink-width');

        $('.tk-collapse-toggle-text').text(l10n('toolkit.expand', 'Expand'));

        Ember.run.next(() => {
          window.dispatchEvent(new Event('resize'));
        });
      });
    } else {
      Promise.all([
        $('.ynab-u.sidebar')
          .animate({ width: '260px' })
          .promise(),
        $('.ynab-u.content')
          .animate({ left: '260px' })
          .promise(),
        $('.budget-header')
          .animate({ left: '260px' })
          .promise(),
      ]).then(() => {
        $('.layout.user-logged-in').removeClass('collapsed');
        $('.ynabtk-navlink-reports-link span').removeClass('ynabtk-nav-link-collapsed');
        $('.ynabtk-collapse-link span').removeClass('ynabtk-nav-link-collapsed');
        $('.ynabtk-collapse-icon')
          .removeClass('right-circle-4')
          .addClass('left-circle-4');
        this.getHideElements().show();
        this.getNavLinkItems().removeClass('tk-navlink-width');

        $('.tk-collapse-toggle-text').text(l10n('toolkit.collapse', 'Collapse'));

        Ember.run.next(() => {
          window.dispatchEvent(new Event('resize'));
        });
      });
    }
  }

  getNavLinkItems() {
    return $(`
      .navlink-budget div,
      .navlink-reports div,
      .navlink-accounts div,
      .tk-react-reports-link div,
      .tk-collapse-toggle-text
    `);
  }

  getHideElements() {
    return $(`
      .nav-accounts,
      .button-sidebar.nav-add-account,
      .referral-program,
      .sidebar-nav-menu,
      .navlink-budget div,
      .navlink-reports div,
      .navlink-accounts div,
      .tk-react-reports-link div,
      .tk-collapse-toggle-text
    `);
  }
}
