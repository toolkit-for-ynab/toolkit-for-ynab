import * as React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { componentPrepend } from 'toolkit/extension/utils/react';
import ReactMarkdown from 'react-markdown';

export class MemoAsMarkdown extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  shouldInvoke() {
    return true;
  }

  applyMarkdown = element => {
    const view = getEmberView(element.getAttribute('id'));
    if (!view) {
      return;
    }

    const toolkitMemoContainer = element.querySelector('.tk-markdown-memo');
    if (toolkitMemoContainer) {
      return;
    }

    const handleClick = event => {
      if (event.target.tagName === 'A') {
        event.stopPropagation();
      }
    };

    const note = view.get('attrs.content.value.memo');
    const originalMemo = element.querySelector('.ynab-grid-cell-memo .user-entered-text');
    if (note && originalMemo) {
      originalMemo.remove();

      componentPrepend(
        <div className="tk-markdown-memo" onClick={handleClick}>
          <ReactMarkdown
            source={note}
            linkTarget="_blank"
            renderers={{
              link: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          />
        </div>,
        element.querySelector('.ynab-grid-cell-memo')
      );
    }
  };

  invoke() {
    addToolkitEmberHook(this, 'register/grid-row', 'didRender', this.applyMarkdown);
  }
}
