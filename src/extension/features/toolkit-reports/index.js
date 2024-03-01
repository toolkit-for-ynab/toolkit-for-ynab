import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Feature } from 'toolkit/extension/features/feature';
import { Root } from './pages/root';
import { l10n } from 'toolkit/extension/utils/toolkit';
import './common/scss/helpers.scss';

const TOOLKIT_REPORTS_CONTAINER_ID = 'toolkit-reports';
const TOOLKIT_REPORTS_NAVLINK_CLASS = 'tk-react-reports-link';
const TOOLKIT_REPORTS_NAVLINK_SELECTOR = `.${TOOLKIT_REPORTS_NAVLINK_CLASS}`;

// Note: YNAB_CONTENT_CONTAINER SELECTOR will contain two elements when this is rendered
//       The current nav's report and then a element containing toolkit reports
//       When toolkit reports is selected, show the toolkit report element and hide the current ynabs element
const YNAB_CONTENT_CONTAINER_SELECTOR = '.ynab-u.content';
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

  destroy() {
    $(TOOLKIT_REPORTS_NAVLINK_SELECTOR).remove();
    $('#TOOLKIT_REPORTS_CONTAINER_ID').remove();
  }

  invoke() {
    if (!document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID)) {
      $(YNAB_CONTENT_CONTAINER_SELECTOR).append(
        $('<div>', {
          id: TOOLKIT_REPORTS_CONTAINER_ID,
        })
      );
    }

    if (!$(TOOLKIT_REPORTS_NAVLINK_SELECTOR).length) {
      const toolkitReportsLink = $('<li>', {
        class: `navlink ${TOOLKIT_REPORTS_NAVLINK_CLASS}`,
      }).append(
        $('<a>', { class: 'tk-navlink' })
          .append(
            $(`<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 10C21 6.13401 17.866 3 14 3V10H21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11 21C15.4183 21 19 17.4183 19 13H11V5C6.58172 5 3 8.58172 3 13C3 17.4183 6.58172 21 11 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)
          )
          .append(
            $('<div>', { class: 'tk-navlink__label' }).text(
              l10n('toolkit.reports', 'Toolkit Reports')
            )
          )
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

    // Show the current ynab report
    $(YNAB_CONTENT_CONTAINER_SELECTOR).children().first().show();

    // Unmount and hide the toolkit's report
    if (this.reactRoot) {
      this.reactRoot.unmount();
    }
    const container = document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID);
    if (container) {
      $(container).css('height', '');
    }

    // Update the nav with the active indicator
    const $currentTarget = $(event.currentTarget);
    if (YNAB_NAVLINK_CLASSES.some((className) => $currentTarget.hasClass(className))) {
      $currentTarget.addClass('active');
    } else if ($currentTarget.hasClass(YNAB_NAVACCOUNT_CLASS)) {
      $currentTarget.addClass('is-selected');
    }
  }

  _renderToolkitReports = () => {
    setTimeout(() => {
      // Hide the ynab report
      $(YNAB_CONTENT_CONTAINER_SELECTOR).children().first().hide();

      // Display the toolkit's report
      const container = document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID);
      if (container) {
        $(container).css('height', '100%');
        this.reactRoot = ReactDOM.createRoot(container);
        this.reactRoot.render(React.createElement(Root));
      }
    }, 50);
  };

  onRouteChanged() {
    this.invoke();
  }
}
