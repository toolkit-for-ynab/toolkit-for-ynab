import React from 'react';
import resources from '../resources';

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
      {/* Back Button */}
      {currentSelectionIndex > 0 && <button className="flaticon stroke left-2" onClick={onBack} />}

      {/* Carousel Text */}
      <span className="tk-mg-x-1">
        {currentSelectionIndex == 0 && maxSelectionIndex == 0
          ? resources.noOptionsAvailable
          : `${currentSelectionIndex} ${resources.of} ${maxSelectionIndex}`}
      </span>

      {/* Forward Button */}
      {currentSelectionIndex < maxSelectionIndex && (
        <button className="flaticon stroke right-2" onClick={onForward} />
      )}
    </div>
  );
};
