import React from 'react';

interface CarouselSelectorProps {
  onBack: () => void;
  onForward: () => void;
  currentSelectionIndex: number;
  maxSelectionIndex: number;
}

export const CarouselSelector: React.FC<CarouselSelectorProps> = ({
  onBack,
  onForward,
  currentSelectionIndex,
  maxSelectionIndex,
}) => {
  return (
    <div className="tk-mg-b-1">
      <button className="flaticon stroke left-2" onClick={onBack} />
      <span className="tk-mg-x-1">
        {currentSelectionIndex} of {maxSelectionIndex}
      </span>
      <button className="flaticon stroke right-2" onClick={onForward} />
    </div>
  );
};
