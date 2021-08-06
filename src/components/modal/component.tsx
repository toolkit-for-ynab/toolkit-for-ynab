import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

interface PublicProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title?: string;
}

export function Modal({ children, isOpen, title, setIsOpen }: PublicProps) {
  return isOpen
    ? ReactDOM.createPortal(
        <>
          <div className="modal-overlay" />
          <div className="modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
            <FontAwesomeIcon
              className="modal__close"
              icon={faTimes}
              onClick={() => setIsOpen(false)}
            />
            <div className="modal__header">
              <h1 id="modal-title" className="modal__title">
                {title}
              </h1>
            </div>
            <div className="modal__content">{children}</div>
            <div className="modal__footer">
              <button className="modal__cancel" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button className="modal__confirm">Save</button>
            </div>
          </div>
        </>,
        document.body
      )
    : null;
}

export function useModal(defaultIsOpen: boolean = false) {
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen);

  return {
    isOpen,
    setIsOpen,
  };
}
