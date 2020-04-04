/**
 * This file defines the item that will be added to the navigation
 * sidebar as a button. The button represents a category of items
 * that are related. i.e. Toolkit Reports or Toolkit Tools.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Feature } from 'toolkit/extension/features/feature';
import { Root } from './tools/root';
import { l10n } from 'toolkit/extension/utils/toolkit';
import './common/scss/helpers.scss';

const TOOLKIT_TOOLS_CONTAINER_ID = 'toolkit-tools'; // page
const TOOLKIT_TOOLS_CONTAINER_ID_SELECTOR = `#${TOOLKIT_TOOLS_CONTAINER_ID}`;
const TOOLKIT_TOOLS_REACT_CLASS = 'tk-navlink-tools-link'; // sidebar
const TOOLKIT_TOOLS_NAVLINK_CLASS = 'tk-react-tools-link'; // sidebar
const TOOLKIT_TOOLS_NAVLINK_CLASS_SELECTOR = `.${TOOLKIT_TOOLS_NAVLINK_CLASS}`;

const TOOLKIT_REPORTS_CONTAINER_ID = 'toolkit-reports';
const TOOLKIT_REPORTS_CONTAINER_ID_SELECTOR = `#${TOOLKIT_REPORTS_CONTAINER_ID}`;
const TOOLKIT_REPORTS_NAVLINK_CLASS = 'tk-react-reports-link';
const TOOLKIT_REPORTS_NAVLINK_CLASS_SELECTOR = `.${TOOLKIT_REPORTS_NAVLINK_CLASS}`;
const TOOLKIT_REPORTS_REACT_CLASS_SELECTOR = `.${TOOLKIT_REPORTS_NAVLINK_CLASS}`;

const YNAB_CONTENT_CONTAINER_CLASS_SELECTOR = '.ynab-u.content';
const YNAB_APPLICATION_CONTENT_SELECTOR = `${YNAB_CONTENT_CONTAINER_CLASS_SELECTOR} .scroll-wrap,.register-flex-columns`;
const YNAB_NAVLINK_CLASSES = [
  'navlink-budget',
  'navlink-accounts',
  'navlink-reports',
  TOOLKIT_TOOLS_NAVLINK_CLASS,
  TOOLKIT_REPORTS_NAVLINK_CLASS,
];
const YNAB_NAVLINK_SELECTOR = `.${YNAB_NAVLINK_CLASSES.join(', .')}`;
const YNAB_NAVACCOUNT_CLASS = 'nav-account-row';
const YNAB_NAVACCOUNT_SELECTOR = `.${YNAB_NAVACCOUNT_CLASS}`;

export class ToolkitTools extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    // Add the toolkit tools page if it doesn't exist.
    if (!document.getElementById(TOOLKIT_TOOLS_CONTAINER_ID)) {
      $(YNAB_CONTENT_CONTAINER_CLASS_SELECTOR).append(
        $('<div>', {
          id: TOOLKIT_TOOLS_CONTAINER_ID,
          css: { height: '100%' },
        })
      );
    }

    // Add the tools button to the navigation sidebar if it doesn't exist.
    if (!$(TOOLKIT_TOOLS_NAVLINK_CLASS_SELECTOR).length) {
      const toolkitToolsLink = $('<li>', {
        class: TOOLKIT_TOOLS_NAVLINK_CLASS,
      }).append(
        $('<a>', { class: TOOLKIT_TOOLS_REACT_CLASS })
          .append($('<span>', { class: 'flaticon stroke toolbox' }))
          .append(l10n('toolkit.tools') || 'Toolkit Tools')
      );

      $('.nav-main > li:eq(1)').after($('.navlink-reports'));

      toolkitToolsLink.click(() => {
        this._updateNavigation();
        this._renderToolkitTools();
      });

      // Move our buttton after the toolkit reports button
      $('.nav-main .tk-react-reports-link').after(toolkitToolsLink);
    }

    this._hideReportsPage(); // Blindly hide the reports page.
  }

  _updateNavigation() {
    // remove the active class from all navigation items and add active to our guy
    $(YNAB_NAVLINK_SELECTOR).removeClass('active');
    $(YNAB_NAVACCOUNT_SELECTOR).removeClass('is-selected');
    $(TOOLKIT_REPORTS_NAVLINK_CLASS_SELECTOR).addClass('active');
    $(`${YNAB_NAVLINK_SELECTOR}, ${YNAB_NAVACCOUNT_SELECTOR}`).on(
      'click',
      this._removeToolkitTools
    );

    $(TOOLKIT_REPORTS_REACT_CLASS_SELECTOR).removeClass('active');

    this._hideReportsPage();
  }

  _removeToolkitTools(event) {
    $(TOOLKIT_TOOLS_NAVLINK_CLASS_SELECTOR).removeClass('active');
    $(YNAB_APPLICATION_CONTENT_SELECTOR).show();

    const container = document.getElementById(TOOLKIT_TOOLS_CONTAINER_ID);
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

  _renderToolkitTools() {
    setTimeout(() => {
      $(YNAB_APPLICATION_CONTENT_SELECTOR).hide();

      const container = document.getElementById(TOOLKIT_TOOLS_CONTAINER_ID);
      if (container) {
        // This is where the most recently active tool will be instantiated.
        ReactDOM.render(React.createElement(Root), container);
      } else {
        container.innerHTML = `<div class="tk-flex tk-pd-l-05 tk-flex-shrink-none tk-align-items-center tk-report-selector">
        <div class="tk-mg-r-05 tk-report-selector__item tk-report-selector__item--active" data-report-key="net-worth">Nope</div>
        <div class="tk-mg-r-05 tk-report-selector__item" data-report-key="spending-by-category">not working</div>
        <div class="tk-mg-r-05 tk-report-selector__item" data-report-key="spending-by-payee">yet!</div>
        </div>`;
      }

      this._showToolsPage();
    }, 50);
  }

  _hideReportsPage() {
    $(TOOLKIT_REPORTS_CONTAINER_ID_SELECTOR).hide();
  }

  _showToolsPage() {
    $(TOOLKIT_TOOLS_CONTAINER_ID_SELECTOR).show();
  }

  onRouteChanged() {
    this.invoke();
  }
}
