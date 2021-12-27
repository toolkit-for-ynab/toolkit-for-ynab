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
  let shouldShowBackButton: boolean = currentSelectionIndex > 0;
  let shouldShowFowardButton: boolean = currentSelectionIndex + 1 < maxSelectionIndex;
  return (
    <div className="tk-mg-b-1">
      {/* Back Button */}
      {shouldShowBackButton && <button className="flaticon stroke left-2" onClick={onBack} />}

      {/* Carousel Text */}
      <span className="tk-mg-x-1">
        {currentSelectionIndex == 0 && maxSelectionIndex == 0
          ? resources.noOptionsAvailable
          : `${currentSelectionIndex + 1} ${resources.of} ${maxSelectionIndex}`}
      </span>

      {/* Forward Button */}
      {shouldShowFowardButton && <button className="flaticon stroke right-2" onClick={onForward} />}
    </div>
  );
};
