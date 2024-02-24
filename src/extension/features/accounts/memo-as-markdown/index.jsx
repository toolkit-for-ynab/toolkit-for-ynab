import * as React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { componentPrepend } from 'toolkit/extension/utils/react';
import ReactMarkdown from 'react-markdown';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { isClassInChangedNodes } from 'toolkit/extension/utils/helpers';

export class MemoAsMarkdown extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  applyMarkdown = (element) => {
    const transactionRows = getEmberView(element.id)?.componentRows;
    if (!transactionRows || !transactionRows.length) {
      return;
    }
    transactionRows.forEach((row) => {
      if (!row.content?.entityId) {
        return;
      }
      const selector = `[data-row-id='${row.content.entityId}'].ynab-grid-body-row`;
      const transactionElement = element.querySelector(selector);
      if (!transactionElement) {
        return;
      }

      const toolkitMemoContainer = transactionElement.querySelector('.tk-markdown-memo');
      if (toolkitMemoContainer) {
        return;
      }

      const note = row?.content?.memo;
      const originalMemo = transactionElement.querySelector('.ynab-grid-cell-memo span');
      if (note && originalMemo) {
        $(originalMemo).hide();

        const handleClick = (event) => {
          if (event.target.tagName === 'A') {
            event.stopPropagation();
          }
        };

        componentPrepend(
          <div className="tk-markdown-memo" onClick={handleClick}>
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
          </div>,
          transactionElement.querySelector('.ynab-grid-cell-memo')
        );
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

    if (isClassInChangedNodes('ynab-grid-body-row', changedNodes)) {
      this.invoke();
    }
  }

  destroy() {
    $('.ynab-grid-cell-memo span').show();
    $('.tk-markdown-memo').remove();
  }
}
