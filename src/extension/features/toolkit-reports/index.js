import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Feature } from 'toolkit/extension/features/feature';
import { Root } from './pages/root';
import './common/scss/helpers.scss';

const TOOLKIT_REPORTS_CONTAINER_ID = 'toolkit-reports';

export class ReactReports extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() { return true; }

  invoke() {
    if (!document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID)) {
      $('.ynab-u.content').append($('<div>', {
        id: 'toolkit-reports',
        css: { height: '100%' }
      }));
    }

    if (!$('.tk-react-reports-link').length) {
      const toolkitReportsLink = $('<li>', { class: 'tk-react-reports-link' })
        .append($('<a>', { class: 'tk-navlink-reports-link' })
          .append($('<span>', { class: 'flaticon stroke document-4' }))
          .append((ynabToolKit.l10nData && ynabToolKit.l10nData['sidebar.reports']) || 'React Reports'));

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
    $('.navlink-budget, .navlink-accounts').removeClass('active');
    $('.nav-account-row').removeClass('is-selected');
    $('.tk-react-reports-link').addClass('active');

    $('.navlink-budget, .navlink-accounts, .nav-account-row').on('click', (event) => {
      ReactDOM.unmountComponentAtNode(document.getElementById(TOOLKIT_REPORTS_CONTAINER_ID));

      const $currentTarget = $(event.currentTarget);
      if ($currentTarget.hasClass('navlink-budget') || $currentTarget.hasClass('navlink-accounts')) {
        $currentTarget.addClass('active');
      } else if ($currentTarget.hasClass('nav-account-row')) {
        $currentTarget.addClass('is-selected');
      }
    });
  }

  _renderToolkitReports() {
    $('.ynab-u.content .scroll-wrap,.register-flex-columns').hide();
    ReactDOM.render(React.createElement(Root), document.getElementById('toolkit-reports'));
  }

  onRouteChanged() {
    this.invoke();
  }
}
