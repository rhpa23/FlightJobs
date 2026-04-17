import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <InformationCircleIcon className="w-4 h-4 text-gray-500 cursor-help" />
      )}
      
      {isVisible && (
        <span
          className={`absolute ${positionClasses[position]} px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 animate-fade-in pointer-events-none z-50 border border-gray-700 shadow-lg max-w-xs`}
          style={{ animation: 'fadeIn 0.15s ease-in-out forwards' }}
        >
          {content}
          {/* Arrow */}
          <span
            className={`absolute w-2 h-2 bg-gray-900 border-gray-700 ${
              position === 'top'
                ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b rotate-45'
                : position === 'bottom'
                ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t rotate-45'
                : position === 'left'
                ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t rotate-45'
                : 'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b rotate-45'
            }`}
          />
        </span>
      )}
    </span>
  );
};
