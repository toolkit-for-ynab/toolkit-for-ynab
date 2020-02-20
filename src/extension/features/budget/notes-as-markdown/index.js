import * as React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { componentAppend } from 'toolkit/extension/utils/react';
import ReactMarkdown from 'react-markdown';

export class NotesAsMarkdown extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  shouldInvoke() {
    return true;
  }

  applyMarkdown = element => {
    const view = getEmberView(element.getAttribute('id'));
    const ynabNoteContainer = element.querySelector('.inspector-category-note');
    if (!view || !ynabNoteContainer) {
      return;
    }

    const toolkitNoteContainer = element.querySelector('.tk-markdown-note');
    const markdownGuide = ynabNoteContainer.querySelector('.tk-markdown-guide');
    if (toolkitNoteContainer) {
      toolkitNoteContainer.remove();
    }

    if (markdownGuide) {
      markdownGuide.remove();
    }

    if (view.isEditing) {
      ynabNoteContainer.classList.remove('hidden');

      const textarea = ynabNoteContainer.querySelector('textarea');
      if (textarea) {
        textarea.style.height = '8rem';
        textarea.focus();
      }

      return;
    }

    const handleClick = event => {
      if (event.target.tagName === 'A') {
        event.stopPropagation();
        return;
      }

      view.set('isEditing', true);
    };

    const note = view.get('activeCategory.subCategory.note');
    if (note) {
      ynabNoteContainer.classList.add('hidden');
      componentAppend(
        <div className="tk-markdown-note" onClick={handleClick}>
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
        element
      );
    } else {
      ynabNoteContainer.classList.remove('hidden');
    }
  };

  invoke() {
    addToolkitEmberHook(this, 'budget/inspector/inspector-notes', 'didRender', this.applyMarkdown);
  }
}
