import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { linkifyMemoCell } from './utils';

export class LinkInMemo extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    // Select the memo cells
    let memos = document.querySelectorAll('.ynab-grid-cell-memo:not(.ynab-grid-header-cell)');

    // Loop through each cell to turn it into a link if the memo starts with "https://"
    memos.forEach(linkifyMemoCell);
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
