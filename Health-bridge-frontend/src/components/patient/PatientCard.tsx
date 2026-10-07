import React from 'react';
import { UserCircle2, Mail, Calendar } from 'lucide-react';

export interface PatientCardProps {
  member: {
    id: string;
    name: string;
    relationship: string;
    dateOfBirth: string;
    linkedEmail?: string;
  };
  onDelete?: (id: string) => void;
  onEdit?: (member: any) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ member, onDelete, onEdit }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-950 truncate">{member.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block mt-1">
              {member.relationship}
            </span>
          </div>
        </div>
      </div>
      <div className="text-sm text-zinc-500 space-y-2 mb-4">
        <p className="flex items-center gap-2"><Calendar size={14}/> {member.dateOfBirth || "N/A"}</p>
        {member.linkedEmail && (
          <p className="flex items-center gap-2 truncate"><Mail size={14}/> {member.linkedEmail}</p>
        )}
      </div>
      
      <div className="flex gap-2 border-t border-zinc-100 pt-4">
        {onEdit && (
          <button 
            onClick={() => onEdit(member)} 
            className="flex-1 text-zinc-600 text-sm font-medium hover:bg-zinc-50 border border-zinc-200 py-1.5 rounded-lg transition"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button 
            onClick={() => onDelete(member.id)} 
            className="flex-1 text-red-500 text-sm font-medium hover:bg-red-50 border border-red-100 py-1.5 rounded-lg transition"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};
