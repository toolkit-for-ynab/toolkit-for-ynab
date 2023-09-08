import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class LinkInMemo extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    // Select the memo cells
    let memos = document.querySelectorAll('.ynab-grid-cell-memo:not(.ynab-grid-header-cell)');

    // Loop through each cell to turn it into a link if the memo starts with "https://"
    memos.forEach((memo) => {
      if (!memo.dataset.isLink) {
        let title = memo.getAttribute('title');
        if (typeof title === 'string' && title.toLowerCase().startsWith('https://')) {
          // Get the span containing the full link (title may be truncacted)
          let span = memo.querySelector('span');

          // Create a link element
          let link = document.createElement('a');
          link.setAttribute('href', span.innerText);
          link.setAttribute('target', '_blank');
          link.innerText = span.innerText;

          // Swap the original text for the link
          span.innerText = '';
          span.appendChild(link);

          // Mark this memo as having a link to prevent duplicate modification
          memo.dataset.isLink = true;
        }
      }
    });
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
