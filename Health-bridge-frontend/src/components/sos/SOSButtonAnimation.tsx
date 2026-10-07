import React from 'react';


interface SOSButtonAnimationProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
}

export const SOSButtonAnimation: React.FC<SOSButtonAnimationProps> = ({ 
  progress, 
  size = 160, 
  strokeWidth = 6 
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="absolute top-0 left-0 w-40 h-40 z-[1] pointer-events-none">
      <svg width={size} height={size}>
        {/* Background Track */}
        <circle
          stroke="#FEE2E2"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
        />
        {/* Progress Ring */}
        <circle
          className="transition-[stroke-dashoffset] duration-100 ease-linear -rotate-90 origin-center"
          stroke="#EF4444"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>
    </div>
  );
};
