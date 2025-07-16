import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Feature } from 'toolkit/extension/features/feature';
import { Root } from './pages/root';
import { l10n } from 'toolkit/extension/utils/toolkit';
import {
  isToolkitReportsURL,
  navigateToToolkitReports,
  getCurrentBudgetId,
} from './utils/url-navigation';
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

    // Remove event listeners
    window.removeEventListener('popstate', this._handlePopState);
    window.removeEventListener('toolkit-reports-url-changed', this._handleURLChanged);
  }

  invoke() {
    if (!document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID)) {
      $(YNAB_CONTENT_CONTAINER_SELECTOR).append(
        $('<div>', {
          id: TOOLKIT_REPORTS_CONTAINER_ID,
        }),
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
</svg>`),
          )
          .append(
            $('<div>', { class: 'tk-navlink__label' }).text(
              l10n('toolkit.reports', 'Toolkit Reports'),
            ),
          ),
      );

      $('.nav-main > li:eq(1)').after(toolkitReportsLink);

      toolkitReportsLink.click(() => {
        this._updateNavigation();
        this._renderToolkitReports();
        // Navigate to toolkit reports URL without a specific tab (will use default or last accessed)
        navigateToToolkitReports();
      });

      $('.nav-main .navlink-reports').after(toolkitReportsLink);
    }

    // Add event listeners for URL navigation
    this._setupURLEventListeners();

    // Check if we should show toolkit reports based on current URL
    // Use a small delay to ensure DOM elements are ready
    setTimeout(() => {
      this._checkURLForToolkitReports();
    }, 100);
  }

  _setupURLEventListeners() {
    // Listen for browser back/forward navigation
    window.addEventListener('popstate', this._handlePopState);

    // Listen for custom URL change events
    window.addEventListener('toolkit-reports-url-changed', this._handleURLChanged);
  }

  _handlePopState = () => {
    // Check if the new URL is a toolkit reports URL
    if (isToolkitReportsURL(window.location.href)) {
      this._updateNavigation();
      this._renderToolkitReports();
    } else {
      this._removeToolkitReports();
    }
  };

  _handleURLChanged = () => {
    // If toolkit reports is already active, just update the report tab
    if ($(TOOLKIT_REPORTS_NAVLINK_SELECTOR).hasClass('active')) {
      // The report tab will be updated by the React component listening to URL changes
      return;
    }

    // Otherwise, activate toolkit reports
    this._updateNavigation();
    this._renderToolkitReports();
  };

  _checkURLForToolkitReports() {
    if (isToolkitReportsURL(window.location.href)) {
      // If we're on a toolkit reports URL but toolkit reports isn't active, activate it
      if (!$(TOOLKIT_REPORTS_NAVLINK_SELECTOR).hasClass('active')) {
        // Make sure the navigation link exists before trying to activate it
        if ($(TOOLKIT_REPORTS_NAVLINK_SELECTOR).length) {
          this._updateNavigation();
          this._renderToolkitReports();
        } else {
          // If the navigation link doesn't exist yet, try again after a short delay
          setTimeout(() => {
            this._checkURLForToolkitReports();
          }, 50);
        }
      }
    }
  }

  _updateNavigation() {
    // remove the active class from all navigation items and add active to our guy
    $(YNAB_NAVLINK_SELECTOR).removeClass('active');
    $(YNAB_NAVACCOUNT_SELECTOR).removeClass('is-selected');
    $(TOOLKIT_REPORTS_NAVLINK_SELECTOR).addClass('active');
    $(`${YNAB_NAVLINK_SELECTOR}, ${YNAB_NAVACCOUNT_SELECTOR}`)
      .off('click', this._removeToolkitReports)
      .on('click', this._removeToolkitReports);
  }

  _removeToolkitReports = (event) => {
    $(TOOLKIT_REPORTS_NAVLINK_SELECTOR).removeClass('active');

    // Show the current ynab report
    $(YNAB_CONTENT_CONTAINER_SELECTOR).children().first().show();

    // Unmount and hide the toolkit's report
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
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

    // If we're currently on a toolkit reports URL, navigate back to the budget page
    if (isToolkitReportsURL(window.location.href)) {
      const budgetId = getCurrentBudgetId();
      if (budgetId) {
        const budgetURL = `${window.location.origin}/${budgetId}/budget`;
        window.history.pushState({}, '', budgetURL);
      }
    }
  };

  _renderToolkitReports = () => {
    setTimeout(() => {
      // Hide the ynab report
      $(YNAB_CONTENT_CONTAINER_SELECTOR).children().first().hide();

      // Display the toolkit's report
      const container = document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID);
      if (container) {
        $(container).css('height', '100%');
        if (!this.reactRoot) {
          this.reactRoot = ReactDOM.createRoot(container);
        }
        this.reactRoot.render(React.createElement(Root));
      }
    }, 50);
  };

  onRouteChanged() {
    this.invoke();

    // Also check for toolkit reports URLs after route changes
    // This handles cases where the user navigates directly to a toolkit reports URL
    setTimeout(() => {
      this._checkURLForToolkitReports();
    }, 100);
  }
}
