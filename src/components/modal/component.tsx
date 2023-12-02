import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';
import { Button } from '../button';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

interface PublicProps {
  children: ReactNode;
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
  const modalRef = useRef<HTMLDivElement | null>(null);

  function handleCancel() {
    if (onCancel) {
      onCancel();
    }

    setIsOpen(false);
  }

  const closeOnEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }, []);

  const handleClick = useCallback((event: MouseEvent) => {
    if (!modalRef.current?.contains(event.target as Node)) {
      handleCancel();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false);
    document.addEventListener('keydown', closeOnEscape, false);

    return () => {
      document.removeEventListener('mousedown', handleClick, false);
      document.removeEventListener('keydown', closeOnEscape, false);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('tk-overflow-hidden');
    } else {
      document.body.classList.remove('tk-overflow-hidden');
    }
  }, [isOpen]);

  return (
    <>
      {ReactDOM.createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div className="modal-wrapper">
              <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              />
              <motion.div
                className={classNames('modal', className)}
                role="dialog"
                aria-labelledby="modal-title"
                aria-modal="true"
                ref={modalRef}
                initial={{ y: '-500px', opacity: 0 }}
                exit={{ y: '-500px', opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="transparent"
                  size="s"
                  onClick={handleCancel}
                  className="modal__close"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
                {title && (
                  <div className="modal__header">
                    <h1 id="modal-title" className="modal__title">
                      {title}
                    </h1>
                  </div>
                )}
                <div className="modal__content">{children}</div>
                <div className="modal__footer">
                  <Button className="modal__cancel" onClick={handleCancel}>
                    {cancelText}
                  </Button>
                  {!!onSubmit && (
                    <Button className="modal__confirm" onClick={onSubmit} variant="primary">
                      {submitText}
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
