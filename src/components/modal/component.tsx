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
  onCancel?: () => void;
  onSubmit?: () => void;
}

export function Modal({ children, isOpen, title, setIsOpen, onCancel, onSubmit }: PublicProps) {
  const modalRef = React.useRef(null);

  function handleCancel() {
    if (onCancel) {
      onCancel();
    }

    setIsOpen(false);
  }

  const closeOnEscape = React.useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }, []);

  const handleClick = React.useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleCancel();
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClick, false);
    document.addEventListener('keydown', closeOnEscape, false);

    return () => {
      document.removeEventListener('mousedown', handleClick, false);
      document.removeEventListener('keydown', closeOnEscape, false);
    };
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('tk-overflow-hidden');
    } else {
      document.body.classList.remove('tk-overflow-hidden');
    }
  }, [isOpen]);

  return isOpen
    ? ReactDOM.createPortal(
        <div className="modal-wrapper">
          <div className="modal-overlay" />
          <div
            className="modal"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
            ref={modalRef}
          >
            <FontAwesomeIcon className="modal__close" icon={faTimes} onClick={handleCancel} />
            <div className="modal__header">
              <h1 id="modal-title" className="modal__title">
                {title}
              </h1>
            </div>
            <div className="modal__content">{children}</div>
            <div className="modal__footer">
              <button className="modal__cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="modal__confirm" onClick={onSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>,
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
