import * as React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { getBudgetService } from 'toolkit/extension/utils/ynab';
import * as ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';

const MARKDOWN_NOTES_CONTAINER_ID = 'tk-note-container';

export class NotesAsMarkdown extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  observe(changedNodes) {
    if (changedNodes.has('inspector-notes') || changedNodes.has('inspector-notes is-editing')) {
      this.applyMarkdown();
    }
  }

  destroy() {
    document.querySelector('.inspector-category-note.tk-hidden')?.classList.remove('tk-hidden');
    document.getElementById(MARKDOWN_NOTES_CONTAINER_ID)?.remove();
  }

  applyMarkdown() {
    const ynabNoteComponent = document.querySelector('.inspector-notes');
    const ynabNoteContent = ynabNoteComponent.querySelector('.inspector-category-note');
    if (!ynabNoteComponent || !ynabNoteContent) {
      return;
    }

    this._ensureContainerElement();
    const toolkitNoteContainer = document.getElementById(MARKDOWN_NOTES_CONTAINER_ID);

    const isEditing = ynabNoteComponent.classList.contains('is-editing');
    if (isEditing) {
      toolkitNoteContainer.classList.add('tk-hidden');
      ynabNoteContent.classList.remove('tk-hidden');

      const textarea = ynabNoteContent.querySelector('textarea');
      if (textarea) {
        textarea.style.height = '8rem';
        textarea.focus();
      }

      return;
    }

    const note = getBudgetService()?.activeCategory?.subCategory?.note;
    if (note) {
      ynabNoteContent.classList.add('tk-hidden');
      toolkitNoteContainer.classList.remove('tk-hidden');
      ReactDOM.render(
        <ReactMarkdown
          linkTarget="_blank"
          components={{
            link: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {note}
        </ReactMarkdown>,
        toolkitNoteContainer
      );
    } else {
      toolkitNoteContainer.classList.add('tk-hidden');
      ynabNoteContent.classList.remove('tk-hidden');
    }
  }

  _ensureContainerElement() {
    const ynabNoteComponent = document.querySelector('.inspector-notes');
    if (!ynabNoteComponent) return;

    if (document.getElementById(MARKDOWN_NOTES_CONTAINER_ID) !== null) return;

    const toolkitNoteContainer = document.createElement('div');
    toolkitNoteContainer.id = MARKDOWN_NOTES_CONTAINER_ID;
    toolkitNoteContainer.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        event.stopPropagation();
        return;
      }

      document.querySelector('.inspector-category-note').click();
    });

    ynabNoteComponent.appendChild(toolkitNoteContainer);
  }
}
