import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Feature } from 'toolkit/extension/features/feature';
import { Root } from './pages/root';
import './common/scss/helpers.scss';

export class ReactReports extends Feature {
  shouldInvoke() { return true; }

  invoke() {
    if (!document.getElementById('toolkit-reports')) {
      $('.ynab-u.content').append($('<div id="toolkit-reports"></div>'));
    }

    if (!$('.toolkit-react-reports-link').length) {
      const toolkitReportsLink = $(`
      <li class="toolkit-react-reports-link">
        React Reports
      </li>`).click(() => {
        $('.ynab-u.content .scroll-wrap').hide();
        ReactDOM.render(
          React.createElement(Root),
          document.getElementById('toolkit-reports')
        );
      });

      $('.nav-main .navlink-reports').after(toolkitReportsLink);
    }
  }

  observe(changedNodes) {
    if (changedNodes.has('nav-main')) {
      this.invoke();
    }
  }
}
