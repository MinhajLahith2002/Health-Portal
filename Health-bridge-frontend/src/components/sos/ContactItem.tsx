import React from 'react';

import { EmergencyContact } from '../../types/contact';
import { Button } from '../common/Button';

interface ContactItemProps {
  contact: EmergencyContact;
  onCall: (phoneNumber: string) => void;
  onDelete?: (id: string) => void;
}

export const ContactItem: React.FC<ContactItemProps> = ({ contact, onCall, onDelete }) => {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
      <div className="flex flex-col">
        <h4 className="text-sm font-bold text-slate-900 m-0">{contact.name}</h4>
        <span className="text-[13px] text-slate-500 mt-0.5">
          {contact.relationship} • {contact.phone || contact.phoneNumber || 'No phone added'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button 
          variant="outline" 
          onClick={() => onCall(contact.phone || contact.phoneNumber || '')}
          disabled={!contact.phone && !contact.phoneNumber}
          icon={<span role="img" aria-label="call">📞</span>}
        >
          Call
        </Button>
        {onDelete && (
          <button 
            onClick={() => onDelete(contact.id)}
            title="Delete Contact"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '16px', 
              opacity: 0.6, 
              padding: '8px'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '1'}
            onMouseOut={e => e.currentTarget.style.opacity = '0.6'}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};
