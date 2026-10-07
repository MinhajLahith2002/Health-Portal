"use client";

import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from '../common/Button';
import { PatientInfo, LocationInfo } from '../../types/emergency';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientInfo;
  location?: LocationInfo;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  isOpen, 
  onClose,
  patient,
  location
}) => {
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

  // Generate QR Code data (for paramedics)
  const qrData = patient 
    ? `PATIENT: ${patient.name}
ID: ${patient.id}
BLOOD: ${patient.bloodType}
ALLERGIES: ${patient.allergies.join(', ')}
CONDITIONS: ${patient.conditions.join(', ')}` 
    : 'No patient data';

  // Generate SMS fallback link
  const smsBody = encodeURIComponent(`EMERGENCY! My location: ${location?.address || 'Unknown'}. Lat: ${location?.latitude || 'Unknown'}, Lng: ${location?.longitude || 'Unknown'}. Blood: ${patient?.bloodType}. Allergies: ${patient?.allergies.join(', ')}`);
  const smsLink = `sms:1990?body=${smsBody}`; // 1990 is the Suwa Seriya Ambulance service in Sri Lanka

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-[fadeIn_0.3s_ease]" onClick={onClose}>
      <div className="bg-white rounded-2xl py-8 px-6 w-[90%] max-w-[340px] flex flex-col items-center text-center shadow-xl animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mb-4">✓</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Emergency Alert Sent!</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Responders and contacts have been notified. Keep this screen open for paramedics.
        </p>

        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748B', marginBottom: '8px' }}>
            SCAN FOR MEDICAL INFO
          </p>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <QRCodeSVG value={qrData} size={150} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <a href={smsLink} style={{ textDecoration: 'none' }}>
            <Button style={{ width: '100%', backgroundColor: '#F59E0B', color: 'white', border: 'none' }}>
              No Internet? Send Offline SMS
            </Button>
          </a>
          
          <Button onClick={onClose} style={{ width: '100%' }}>
            Close Dialog
          </Button>
        </div>
      </div>
    </div>
  );
};
