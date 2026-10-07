import React from 'react';

import { EmergencyType } from '../../types/emergency';
import { EmergencyTypeButton } from './EmergencyTypeButton';

interface EmergencyTypeSelectorProps {
  selectedType: EmergencyType | null;
  onSelect: (type: EmergencyType) => void;
}

const EMERGENCY_TYPES: Array<{ type: EmergencyType; icon: string; colorClass: 'red' | 'blue' | 'gray' }> = [
  { type: 'Chest Pain', icon: '❤️', colorClass: 'red' },
  { type: 'Breathing Issue', icon: '🌬️', colorClass: 'blue' },
  { type: 'Severe Injury', icon: '🩸', colorClass: 'red' },
  { type: 'Other', icon: '📌', colorClass: 'gray' },
];

export const EmergencyTypeSelector: React.FC<EmergencyTypeSelectorProps> = ({
  selectedType,
  onSelect
}) => {
  const [customType, setCustomType] = React.useState('');

  const isOtherSelected = selectedType === 'Other' || (selectedType !== null && !EMERGENCY_TYPES.some(t => t.type === selectedType));

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Specific Emergency Type</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {EMERGENCY_TYPES.map((item) => (
          <EmergencyTypeButton
            key={item.type}
            type={item.type}
            icon={item.icon}
            colorClass={item.colorClass}
            isSelected={item.type === 'Other' ? isOtherSelected : selectedType === item.type}
            onClick={() => {
              if (item.type !== 'Other') {
                setCustomType('');
              }
              onSelect(item.type);
            }}
          />
        ))}
      </div>
      {selectedType === 'Other' && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Please specify your emergency..."
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '14px',
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={() => {
              if (customType.trim()) {
                onSelect(customType as EmergencyType);
              }
            }}
            style={{
              padding: '0 20px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};
