import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const CustomTooltip = ({ description, icon, image, children }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children || (
          <span className="cursor-pointer">
            ℹ️ {/* Fallback trigger if no children provided */}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent
        className="bg-transparent border-none shadow-none p-0"
        side="top" // Position tooltip above the trigger
        align="center" // Center the tooltip relative to the trigger
      >
        <div className="relative max-w-sm text-center">
          {/* Arrow */}
          {/* <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow border border-gray-200 z-10" /> */}

          {/* Tooltip content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-20 relative">
            <h3 className="font-bold text-sm mb-2 text-primary">Reference</h3>
            {description && (
              <p className="text-sm text-gray-800 whitespace-pre-line mb-2">
                {description}
              </p>
            )}
            {image && (
              <img
                src={image}
                alt="Tooltip content"
                className="w-full rounded-md border mb-2"
              />
            )}
            {icon && <div className="text-xl text-gray-700">{icon}</div>}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// Optional: Prop validation with PropTypes
// import PropTypes from 'prop-types';
// CustomTooltip.propTypes = {
//   description: PropTypes.string,
//   icon: PropTypes.node,
//   image: PropTypes.string,
//   children: PropTypes.node,
// };

// Default props
CustomTooltip.defaultProps = {
  description: '',
  icon: null,
  image: '',
  children: null,
};

export default CustomTooltip;