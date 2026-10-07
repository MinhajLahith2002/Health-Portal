import React from 'react';

import { EmergencyContact } from '../../types/contact';
import { ContactItem } from './ContactItem';
import { Button } from '../common/Button';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  onCall: (phoneNumber: string) => void;
  onAddContact: () => void;
  onDeleteContact?: (id: string) => void;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ 
  contacts, 
  onCall,
  onAddContact,
  onDeleteContact
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
        <span role="img" aria-label="phone">📞</span> Emergency Contacts
      </h3>
      
      <div className="flex flex-col gap-3">
        {contacts.map((contact) => (
          <ContactItem 
            key={contact.id} 
            contact={contact} 
            onCall={onCall} 
            onDelete={onDeleteContact}
          />
        ))}
      </div>
      
      <Button 
        variant="outline" 
        className="mt-3 w-full"
        onClick={onAddContact}
      >
        + Add Contact
      </Button>
    </div>
  );
};
