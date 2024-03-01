import * as React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { componentPrepend } from 'toolkit/extension/utils/react';
import ReactMarkdown from 'react-markdown';

export class MemoAsMarkdown extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  shouldInvoke() {
    return true;
  }

  applyMarkdown = (element) => {
    const view = getEmberView(element.getAttribute('id'));
    if (!view) {
      return;
    }

    const toolkitMemoContainer = element.querySelector('.tk-markdown-memo');
    if (toolkitMemoContainer) {
      return;
    }

    const handleClick = (event) => {
      if (event.target.tagName === 'A') {
        event.stopPropagation();
      }
    };

    const note = view?.attrs?.content?.value?.memo;
    const originalMemo = element.querySelector('.ynab-grid-cell-memo span');
    if (note && originalMemo) {
      $(originalMemo).hide();

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
        element.querySelector('.ynab-grid-cell-memo')
      );
    }
  };

  invoke() {
    this.addToolkitEmberHook('register/grid-row', 'didRender', this.applyMarkdown);
    this.addToolkitEmberHook('register/grid-sub', 'didRender', this.applyMarkdown);
  }

  destroy() {
    $('.ynab-grid-cell-memo span').show();
    $('.tk-markdown-memo').remove();
  }
}
