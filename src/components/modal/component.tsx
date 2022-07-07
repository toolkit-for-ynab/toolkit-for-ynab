import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';
import { Button } from '../button';
import classNames from 'classnames';

interface PublicProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title?: string;
  cancelText?: string;
  submitText?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
}

export function Modal({
  children,
  className,
  isOpen,
  title,
  setIsOpen,
  onCancel,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
}: PublicProps) {
  const modalRef = React.useRef<HTMLDivElement | null>(null);

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
    if (!modalRef.current?.contains(event.target as Node)) {
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
            className={classNames('modal', className)}
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
            ref={modalRef}
          >
            <FontAwesomeIcon className="modal__close" icon={faTimes} onClick={handleCancel} />
            {title && (
              <div className="modal__header">
                <h1 id="modal-title" className="modal__title">
                  {title}
                </h1>
              </div>
            )}
            <div className="modal__content">{children}</div>
            <div className="modal__footer">
              <Button className="modal__cancel" onClick={handleCancel} variant="hollow">
                {cancelText}
              </Button>
              <Button className="modal__confirm" onClick={onSubmit} variant="primary">
                {submitText}
              </Button>
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
