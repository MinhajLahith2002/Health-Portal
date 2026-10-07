"use client";

import React, { useState, useEffect } from 'react';

import { Button } from '../common/Button';
import { EmergencyContact } from '../../types/contact';

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: EmergencyContact) => void;
}

export const AddContactDialog: React.FC<AddContactDialogProps> = ({ 
  isOpen, 
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && relationship && phoneNumber) {
      onAdd({
        id: Math.random().toString(36).substring(7),
        name,
        relationship,
        phoneNumber,
        phone: phoneNumber
      });
      setName('');
      setRelationship('');
      setPhoneNumber('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-[fadeIn_0.3s_ease]" onClick={onClose}>
      <div className="bg-white rounded-2xl py-8 px-6 w-[90%] max-w-[340px] flex flex-col items-center text-center shadow-xl animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ marginTop: 0 }}>Add Emergency Contact</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 600, color: '#334155' }}>Name</label>
            <input 
              required
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="E.g. Jane Doe"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 600, color: '#334155' }}>Relationship</label>
            <input 
              required
              type="text" 
              value={relationship} 
              onChange={e => setRelationship(e.target.value)}
              placeholder="E.g. Sister, Friend"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 600, color: '#334155' }}>Phone Number</label>
            <input 
              required
              type="tel" 
              pattern="^[0-9]{10}$"
              title="Phone number must be exactly 10 digits. Example: 0771234567"
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="E.g. 0771234567"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button type="button" onClick={onClose} style={{ flex: 1, backgroundColor: '#F1F5F9', color: '#475569', border: 'none', whiteSpace: 'nowrap' }}>
              Cancel
            </Button>
            <Button type="submit" style={{ flex: 1, whiteSpace: 'nowrap' }}>
              Save Contact
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
