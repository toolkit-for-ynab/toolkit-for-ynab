import * as React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { getBudgetService } from 'toolkit/extension/utils/ynab';
import * as ReactDOM from 'react-dom/client';
import ReactMarkdown from 'react-markdown';

const MARKDOWN_NOTES_CONTAINER_ID = 'tk-note-container';

export class NotesAsMarkdown extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  observe(changedNodes) {
    const startedEditing = changedNodes.has('inspector-notes is-editing');
    const finishedEditing = changedNodes.has('inspector-notes');
    const notesNodeChanged =
      changedNodes.has('inspector-category-note user-data') ||
      changedNodes.has('inspector-category-note user-data tk-hidden');
    const isUpdateCausedByToolkit = !changedNodes.has('ynab-new-inspector-goals-view-goal');
    if (startedEditing || finishedEditing || (notesNodeChanged && !isUpdateCausedByToolkit)) {
      this.applyMarkdown();
    }
  }

  destroy() {
    document.querySelector('.inspector-category-note.tk-hidden')?.classList.remove('tk-hidden');
    document.getElementById(MARKDOWN_NOTES_CONTAINER_ID)?.remove();
  }

  applyMarkdown() {
    const ynabNoteComponent = document.querySelector('.inspector-notes');
    if (!ynabNoteComponent) {
      return;
    }

    const ynabNoteContent = ynabNoteComponent.querySelector('.inspector-category-note');
    if (!ynabNoteContent) {
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
      ReactDOM.createRoot(toolkitNoteContainer).render(
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
