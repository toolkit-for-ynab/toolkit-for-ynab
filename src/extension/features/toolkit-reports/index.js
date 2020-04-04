import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Feature } from 'toolkit/extension/features/feature';
import { Root } from './pages/root';
import { l10n } from 'toolkit/extension/utils/toolkit';
import './common/scss/helpers.scss';
// import { HideDebtsPage } from 'toolkit/extension/features/toolkit-debts';
// import { ShowDebtsPage } from 'toolkit/extension/features/toolkit-debts';

const TOOLKIT_REPORTS_CONTAINER_ID = 'toolkit-reports'; // page
const TOOLKIT_REPORTS_CONTAINER_ID_SELECTOR = `#${TOOLKIT_REPORTS_CONTAINER_ID}`;
const TOOLKIT_REPORTS_NAVLINK_CLASS = 'tk-react-reports-link'; // sidebar
const TOOLKIT_REPORTS_NAVLINK_CLASS_SELECTOR = `.${TOOLKIT_REPORTS_NAVLINK_CLASS}`;

const TOOLKIT_TOOLS_CONTAINER_ID = 'toolkit-tools';
const TOOLKIT_TOOLS_CONTAINER_ID_SELECTOR = `#${TOOLKIT_TOOLS_CONTAINER_ID}`;
const TOOLKIT_TOOLS_REACT_CLASS = 'tk-react-tools-link';
const TOOLKIT_TOOLS_REACT_CLASS_SELECTOR = `.${TOOLKIT_TOOLS_REACT_CLASS}`;

const YNAB_CONTENT_CONTAINER_CLASS_SELECTOR = '.ynab-u.content';
const YNAB_APPLICATION_CONTENT_SELECTOR = `${YNAB_CONTENT_CONTAINER_CLASS_SELECTOR} .scroll-wrap,.register-flex-columns`;
const YNAB_NAVLINK_CLASSES = [
  'navlink-budget',
  'navlink-accounts',
  'navlink-reports',
  TOOLKIT_TOOLS_REACT_CLASS,
  TOOLKIT_REPORTS_NAVLINK_CLASS,
];
const YNAB_NAVLINK_SELECTOR = `.${YNAB_NAVLINK_CLASSES.join(', .')}`;
const YNAB_NAVACCOUNT_CLASS = 'nav-account-row';
const YNAB_NAVACCOUNT_SELECTOR = `.${YNAB_NAVACCOUNT_CLASS}`;

export class ToolkitReports extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    if (!document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID)) {
      // Add the toolkit reports page if it doesn't exist.
      $(YNAB_CONTENT_CONTAINER_CLASS_SELECTOR).append(
        $('<div>', {
          id: TOOLKIT_REPORTS_CONTAINER_ID,
          css: { height: '100%' },
        })
      );

      // this._hideToolsPage();
    }

    if (!$(TOOLKIT_REPORTS_NAVLINK_CLASS_SELECTOR).length) {
      // Add the toolkit reports to the navigation sidebar if it doesn't exist.
      const toolkitReportsLink = $('<li>', {
        class: TOOLKIT_REPORTS_NAVLINK_CLASS,
      }).append(
        $('<a>', { class: 'tk-navlink-reports-link' }) // TODO figure how to replace this literal
          .append($('<span>', { class: 'flaticon stroke document-4' }))
          .append(l10n('toolkit.reports') || 'Toolkit Reports')
      );

      $(`.nav-main > li:eq(1)`).after($('.navlink-reports'));

      toolkitReportsLink.click(() => {
        this._updateNavigation();
        this._renderToolkitReports();
      });

      // Move our button after the built-in reports button
      $('.nav-main .navlink-reports').after(toolkitReportsLink);
    }

    this._hideToolsPage(); // blindly hide the tools page
  }

  _updateNavigation() {
    // remove the active class from all navigation items and add active to our guy
    $(YNAB_NAVLINK_SELECTOR).removeClass('active');
    $(YNAB_NAVACCOUNT_SELECTOR).removeClass('is-selected');
    $(TOOLKIT_REPORTS_NAVLINK_CLASS_SELECTOR).addClass('active');
    $(`${YNAB_NAVLINK_SELECTOR}, ${YNAB_NAVACCOUNT_SELECTOR}`).on(
      'click',
      this._removeToolkitReports
    );

    $(TOOLKIT_TOOLS_REACT_CLASS_SELECTOR).removeClass('active');

    this._hideToolsPage();
  }

  _removeToolkitReports(event) {
    $(TOOLKIT_REPORTS_NAVLINK_CLASS_SELECTOR).removeClass('active');
    $(YNAB_APPLICATION_CONTENT_SELECTOR).show();

    const container = document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID);
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

  _renderToolkitReports() {
    setTimeout(() => {
      $(YNAB_APPLICATION_CONTENT_SELECTOR).hide();

      const container = document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID);
      if (container) {
        ReactDOM.render(React.createElement(Root), container);
        this._showReportsPage();
      }
    }, 50);
  }

  _hideToolsPage() {
    $(TOOLKIT_TOOLS_CONTAINER_ID_SELECTOR).hide();
  }

  _showReportsPage() {
    $(TOOLKIT_REPORTS_CONTAINER_ID_SELECTOR).show();
  }

  onRouteChanged() {
    this.invoke();
  }
}
