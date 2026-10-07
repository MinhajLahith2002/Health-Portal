import React from 'react';

import { EmergencyType } from '../../types/emergency';

interface EmergencyTypeButtonProps {
  type: EmergencyType;
  icon: string;
  colorClass: 'red' | 'blue' | 'gray';
  isSelected: boolean;
  onClick: () => void;
}

export const EmergencyTypeButton: React.FC<EmergencyTypeButtonProps> = ({
  type,
  icon,
  colorClass,
  isSelected,
  onClick
}) => {
  return (
    <button
      className={`flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${isSelected ? (colorClass === 'red' ? 'bg-red-500 text-white' : colorClass === 'blue' ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white') : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} border-0`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <span>{icon}</span>
      <span>{type}</span>
    </button>
  );
};
