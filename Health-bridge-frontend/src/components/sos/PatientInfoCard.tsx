import React from 'react';

import { PatientInfo } from '../../types/emergency';
import { StatusBadge } from '../common/StatusBadge';

interface PatientInfoCardProps {
  patient: PatientInfo;
}

export const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex flex-col mb-3">
        <h3 className="text-base font-bold text-slate-900 m-0">👤 {patient.name}</h3>
        <span className="text-[13px] text-slate-500 mt-0.5">ID: {patient.id}</span>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center">
        <div className="text-[13px] text-slate-600 flex items-center gap-1">
          <span>🩸 Blood Type:</span>
          <StatusBadge label={patient.bloodType} color="green" />
        </div>
        
        <div className="w-px h-4 bg-slate-200"></div>
        
        <div className="text-[13px] text-slate-600 flex items-center gap-1">
          <span>⚠️ Allergies:</span>
          <StatusBadge label={patient.allergies.join(', ')} color="orange" />
        </div>
        
        <div className="w-px h-4 bg-slate-200"></div>
        
        <div className="text-[13px] text-slate-600 flex items-center gap-1">
          <span>🩺 Conditions:</span>
          <span className="text-[13px] text-slate-600 font-medium">{patient.conditions.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};
