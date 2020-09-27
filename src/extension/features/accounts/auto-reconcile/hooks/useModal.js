import { useState } from 'react';
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const show = () => {
    setIsOpen(true);
  };

  const hide = () => {
    setIsOpen(false);
  };

  return [isOpen, show, hide];
};
