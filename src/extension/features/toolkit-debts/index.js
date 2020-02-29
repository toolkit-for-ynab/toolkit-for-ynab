import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Feature } from 'toolkit/extension/features/feature';
// import { Root } from './pages/root';
import { l10n } from 'toolkit/extension/utils/toolkit';
// import './common/scss/helpers.scss';
// import { HideReportsPage } from 'toolkit/extension/features/toolkit-reports';
// import { ShowReportsPage } from 'toolkit/extension/features/toolkit-reports';

const TOOLKIT_DEBTS_CONTAINER_ID = 'toolkit-debts'; // page
const TOOLKIT_DEBTS_NAVLINK_CLASS = 'tk-navlink-debts'; // sidebar
const TOOLKIT_DEBTS_NAVLINK_SELECTOR = `.${TOOLKIT_DEBTS_NAVLINK_CLASS}`;

const TOOLKIT_REPORTS_CONTAINER_ID = '#toolkit-reports';
const TOOLKIT_REPORTS_NAVLINK_SELECTOR = `.${TOOLKIT_REPORTS_NAVLINK_CLASS}`;
const TOOLKIT_REPORTS_NAVLINK_CLASS = 'tk-react-reports-link';

const YNAB_CONTENT_CONTAINER_SELECTOR = '.ynab-u.content';
const YNAB_APPLICATION_CONTENT_SELECTOR = `${YNAB_CONTENT_CONTAINER_SELECTOR} .scroll-wrap,.register-flex-columns`;
const YNAB_NAVLINK_CLASSES = [
  'navlink-budget',
  'navlink-reports',
  'navlink-tk-debts',
  'navlink-tk-reports',
  'navlink-accounts',
];
const YNAB_NAVLINK_SELECTOR = `.${YNAB_NAVLINK_CLASSES.join(', .')}`;
const YNAB_NAVACCOUNT_CLASS = 'nav-account-row';
const YNAB_NAVACCOUNT_SELECTOR = `.${YNAB_NAVACCOUNT_CLASS}`;

export class ToolkitDebts extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    if (!document.getElementById(TOOLKIT_DEBTS_CONTAINER_ID)) {
      // Add the debt tools page if it doesn't exist.
      $(YNAB_CONTENT_CONTAINER_SELECTOR).append(
        $('<div>', {
          id: TOOLKIT_DEBTS_CONTAINER_ID,
          css: { height: '100%' },
        })
      );

      // HideReportsPage(); // Blindly hide the reports page.
    }

    if (!$(TOOLKIT_DEBTS_NAVLINK_SELECTOR).length) {
      // Add the debt tools to the navigation sidebar if it doesn't exist.
      const toolkitDebtsLink = $('<li>', {
        class: TOOLKIT_DEBTS_NAVLINK_CLASS,
      }).append(
        $('<a>', { class: 'tk-navlink-debts' })
          .append($('<span>', { class: 'flaticon stroke document-4' }))
          .append(l10n('toolkit.debts') || 'Debt Tools')
      );

      $('.nav-main > li:eq(1)').after($('.navlink-reports'));

      toolkitDebtsLink.click(() => {
        this._updateNavigation();
        this._renderToolkitDebts();
      });

      $('.nav-main .navlink-reports').after(toolkitDebtsLink);
    }
  }

  _updateNavigation() {
    // remove the active class from all navigation items and add active to our guy
    $(YNAB_NAVLINK_SELECTOR).removeClass('active');
    $(YNAB_NAVACCOUNT_SELECTOR).removeClass('is-selected');
    $(TOOLKIT_DEBTS_NAVLINK_SELECTOR).addClass('active');
    $(`${YNAB_NAVLINK_SELECTOR}, ${YNAB_NAVACCOUNT_SELECTOR}`).on(
      'click',
      this._removeToolkitDebts
    );

    $(TOOLKIT_REPORTS_NAVLINK_SELECTOR).removeClass('active');
    HideReportsPage();
  }

  _removeToolkitDebts(event) {
    $(TOOLKIT_DEBTS_NAVLINK_SELECTOR).removeClass('active');
    $(YNAB_APPLICATION_CONTENT_SELECTOR).show();

    const container = document.getElementById(TOOLKIT_DEBTS_CONTAINER_ID);
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
    }

    const $currentTarget = $(event.currentTarget);
    if (YNAB_NAVLINK_CLASSES.some(className => $currentTarget.hasClass(className))) {
      $currentTarget.addClass('active');
    } else if ($currentTarget.hasClass(YNAB_NAVACCOUNT_CLASS)) {
      $currentTarget.addClass('is-selected');
    }
  }

  _renderToolkitDebts() {
    setTimeout(() => {
      $(YNAB_APPLICATION_CONTENT_SELECTOR).hide();

      const container = document.getElementById(TOOLKIT_DEBTS_CONTAINER_ID);
      if (container) {
        // ReactDOM.render(React.createElement(Root), container);
      }
    }, 50);
  }

  onRouteChanged() {
    this.invoke();
  }
}

function HideReportsPage() {
  $('<div>', {
    id: TOOLKIT_REPORTS_CONTAINER_ID,
    style: 'height: 0%',
  });
  // return {'100%' };
}

export function ShowDebtsPage() {
  $('<div>', {
    id: TOOLKIT_DEBTS_CONTAINER_ID,
    style: 'height: 100%',
  });
  // return {'100%' };
}
