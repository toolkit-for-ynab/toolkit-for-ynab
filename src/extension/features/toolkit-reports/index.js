import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Feature } from 'toolkit/extension/features/feature';
import { Root } from './pages/root';
import { l10n } from 'toolkit/extension/utils/toolkit';
import './common/scss/helpers.scss';

const TOOLKIT_REPORTS_CONTAINER_ID = 'toolkit-reports';
const TOOLKIT_REPORTS_NAVLINK_CLASS = 'tk-react-reports-link';
const TOOLKIT_REPORTS_NAVLINK_SELECTOR = `.${TOOLKIT_REPORTS_NAVLINK_CLASS}`;

const YNAB_CONTENT_CONTAINER_SELECTOR = '.ynab-u.content';
const YNAB_APPLICATION_CONTENT_SELECTOR = `${YNAB_CONTENT_CONTAINER_SELECTOR} .scroll-wrap,.register-flex-columns`;
const YNAB_NAVLINK_CLASSES = ['navlink-budget', 'navlink-accounts', 'navlink-reports'];
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
      $(YNAB_CONTENT_CONTAINER_SELECTOR).append(
        $('<div>', {
          id: TOOLKIT_REPORTS_CONTAINER_ID,
          css: { height: '100%' },
        })
      );
    }

    if (!$(TOOLKIT_REPORTS_NAVLINK_SELECTOR).length) {
      const toolkitReportsLink = $('<li>', {
        class: TOOLKIT_REPORTS_NAVLINK_CLASS,
      }).append(
        $('<a>', { class: 'tk-navlink-reports-link' })
          .append($('<span>', { class: 'flaticon stroke document-4' }))
          .append(l10n('toolkit.reports') || 'Toolkit Reports')
      );

      $('.nav-main > li:eq(1)').after(toolkitReportsLink);

      toolkitReportsLink.click(() => {
        this._updateNavigation();
        this._renderToolkitReports();
      });

      $('.nav-main .navlink-reports').after(toolkitReportsLink);
    }
  }

  _updateNavigation() {
    // remove the active class from all navigation items and add active to our guy
    $(YNAB_NAVLINK_SELECTOR).removeClass('active');
    $(YNAB_NAVACCOUNT_SELECTOR).removeClass('is-selected');
    $(TOOLKIT_REPORTS_NAVLINK_SELECTOR).addClass('active');
    $(`${YNAB_NAVLINK_SELECTOR}, ${YNAB_NAVACCOUNT_SELECTOR}`).on(
      'click',
      this._removeToolkitReports
    );
  }

  _removeToolkitReports(event) {
    $(TOOLKIT_REPORTS_NAVLINK_SELECTOR).removeClass('active');
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
      }
    }, 50);
  }

  onRouteChanged() {
    this.invoke();
  }
}
