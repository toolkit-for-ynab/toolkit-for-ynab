import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Feature } from 'toolkit/extension/features/feature';
import ReactMarkdown from 'react-markdown';
import { getRegisterGridService, isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class MemoAsMarkdown extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  applyMarkdown = (element) => {
    const transactionRows = getRegisterGridService().visibleTransactionDisplayItems;
    if (!transactionRows || !transactionRows.length) {
      return;
    }

    transactionRows.forEach((row) => {
      if (!row.entityId) {
        return;
      }
      const selector = `[data-row-id='${row.entityId}'].ynab-grid-body-row`;
      const transactionElement = element.querySelector(selector);
      if (!transactionElement) {
        return;
      }

      const toolkitMemoContainer = transactionElement.querySelector('.tk-markdown-memo');
      if (toolkitMemoContainer) {
        return;
      }

      const note = row?.memo;
      const originalMemo = transactionElement.querySelector(
        '.ynab-grid-cell-memo span:not(.tk-markdown-memo)'
      );
      if (note && originalMemo) {
        $(originalMemo).hide();

        const handleClick = (event) => {
          if (event.target.tagName === 'A') {
            event.stopPropagation();
          }
        };

        const span = document.createElement('span');
        span.className = 'tk-markdown-memo';
        span.onclick = handleClick;
        ReactDOM.createRoot(span).render(
          <ReactMarkdown
            components={{
              link: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {note}
          </ReactMarkdown>
        );
        const memoCell = transactionElement.querySelector('.ynab-grid-cell-memo');
        if (memoCell) {
          memoCell.prepend(span);
        }
      }
    });
  };

  invoke() {
    const gridContainer = document.querySelector('.ynab-grid-container');
    if (!gridContainer) {
      return;
    }

    this.applyMarkdown(gridContainer);
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-body-row')) {
      this.invoke();
    }
  }

  destroy() {
    $('.ynab-grid-cell-memo span').show();
    $('.tk-markdown-memo').remove();
  }
}
