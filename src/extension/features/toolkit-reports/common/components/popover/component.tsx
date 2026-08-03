import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './styles.scss';

const VIEWPORT_MARGIN = 12;
const TRIGGER_GAP = 4;
const MIN_CONTENT_HEIGHT = 150;

export type PopoverTriggerProps = {
  isOpen: boolean;
  toggle: () => void;
};

export type PopoverProps = {
  align?: 'left' | 'right';
  disabled?: boolean;
  renderTrigger: (props: PopoverTriggerProps) => React.ReactNode;
  children: (props: { close: () => void }) => React.ReactNode;
};

type Position = {
  top: number;
  left: number;
  maxHeight: number;
  maxWidth: number;
};

export function Popover({ align = 'left', disabled, renderTrigger, children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setPosition(null);
  }, []);

  const toggle = useCallback(() => {
    if (disabled) {
      return;
    }
    setIsOpen((wasOpen) => !wasOpen);
  }, [disabled]);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) {
      return;
    }

    function reposition() {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const contentRect = contentRef.current!.getBoundingClientRect();

      const maxWidth = window.innerWidth - VIEWPORT_MARGIN * 2;
      const contentWidth = Math.min(contentRect.width, maxWidth);

      const preferredLeft = align === 'right' ? triggerRect.right - contentWidth : triggerRect.left;
      const left = Math.min(
        Math.max(preferredLeft, VIEWPORT_MARGIN),
        window.innerWidth - contentWidth - VIEWPORT_MARGIN,
      );

      const top = Math.min(
        triggerRect.bottom + TRIGGER_GAP,
        window.innerHeight - VIEWPORT_MARGIN - MIN_CONTENT_HEIGHT,
      );
      const maxHeight = window.innerHeight - top - VIEWPORT_MARGIN;

      setPosition({ top, left, maxHeight, maxWidth });
    }

    reposition();

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [isOpen, align]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !contentRef.current?.contains(target)) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  return (
    <div className="tk-popover" ref={triggerRef}>
      {renderTrigger({ isOpen, toggle })}
      {isOpen && (
        <div
          className="tk-popover__content"
          ref={contentRef}
          style={
            position
              ? {
                  top: position.top,
                  left: position.left,
                  maxHeight: position.maxHeight,
                  maxWidth: position.maxWidth,
                }
              : { top: 0, left: 0, visibility: 'hidden' }
          }
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}
