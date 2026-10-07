"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SOSButton } from './SOSButton';
import { PatientInfoCard } from './PatientInfoCard';
import { EmergencyTypeSelector } from './EmergencyTypeSelector';
import { LocationCard } from './LocationCard';
import { EmergencyContacts } from './EmergencyContacts';
import { AddContactDialog } from './AddContactDialog';
import { ResponseLog } from './ResponseLog';
import { ActiveEmergencyBanner } from './ActiveEmergencyBanner';
import { VoiceWave } from './VoiceWave';
import { EmergencyType, PatientInfo, LocationInfo } from '../../types/emergency';
import { EmergencyContact } from '../../types/contact';
import { getStoredUser } from '@/lib/auth';

// Mock data for the UI
const defaultPatient: PatientInfo = {
  name: 'Sarah Johnson',
  id: 'PT-2026-00458',
  bloodType: 'O+',
  allergies: ['Penicillin'],
  conditions: ['Type 1 Diabetes', 'Hypertension'],
};

const initialLocation: LocationInfo = {
  address: 'Locating...',
  estimatedArrivalMins: { min: 8, max: 12 },
};

export const EmergencySOS: React.FC = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [location, setLocation] = useState<LocationInfo>(initialLocation);
  const [isLocationManuallySet, setIsLocationManuallySet] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [patient, setPatient] = useState<PatientInfo>(defaultPatient);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const isManuallySetRef = useRef(false);
  
  useEffect(() => {
    isManuallySetRef.current = isLocationManuallySet;
  }, [isLocationManuallySet]);

  useEffect(() => {
    if (!isEmergencyActive) setHasArrived(false);
  }, [isEmergencyActive]);

  const [alertHistory, setAlertHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const user = getStoredUser();
      const userId = user?.id || 'user-123';
      const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
      const res = await fetch(`http://localhost:8088/api/sos/history?userId=${userId}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
          const data = await res.json();
          const processAlerts = (alertsArray: any[]) => 
            alertsArray
              .sort((a, b) => new Date(b.triggeredAt || 0).getTime() - new Date(a.triggeredAt || 0).getTime())
              .slice(0, 10);

          if (data.data && Array.isArray(data.data.alerts)) {
            setAlertHistory(processAlerts(data.data.alerts));
          } else if (data.data && Array.isArray(data.data.content)) {
            setAlertHistory(processAlerts(data.data.content));
          } else if (data.data && Array.isArray(data.data)) {
            setAlertHistory(processAlerts(data.data));
          } else if (Array.isArray(data)) {
            setAlertHistory(processAlerts(data));
          } else {
            setAlertHistory(processAlerts(data.alerts || []));
          }
        }
    } catch (e) {
      console.error("Failed to fetch SOS history:", e);
    }
  };

  const fetchContacts = async () => {
    try {
      const user = getStoredUser();
      const userId = user?.id || 'user-123';
      const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
      const res = await fetch(`http://localhost:8088/api/contacts?userId=${userId}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data.contacts)) {
          setContacts(data.data.contacts);
        } else if (data.data && Array.isArray(data.data)) {
          setContacts(data.data);
        } else if (Array.isArray(data)) {
          setContacts(data);
        } else {
          setContacts(data.contacts || []);
        }
      }
    } catch (e) {
      console.error("Failed to fetch contacts:", e);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchContacts();

    // 0. Setup User
    const user = getStoredUser();
    if (user) {
      setPatient(prev => ({
        ...prev,
        name: user.fullName || prev.name,
        id: user.id || prev.id
      }));

      const fetchProfile = async () => {
        try {
          const res = await fetch('http://localhost:8088/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('healthbridge_token')}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setPatient(prev => {
              let fetchedAllergies = data.allergies || [];
              let fetchedConditions = data.conditions || [];
              
              if (fetchedAllergies.length === 1 && fetchedAllergies[0] === 'Peanuts') {
                fetchedAllergies = [];
              }
              if (fetchedConditions.length === 1 && fetchedConditions[0] === 'Asthma') {
                fetchedConditions = data.medicalHistory ? [data.medicalHistory] : [];
              }

              return {
                ...prev,
                bloodType: data.bloodGroup || 'Unknown',
                allergies: fetchedAllergies,
                conditions: fetchedConditions
              };
            });
          }
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        }
      };
      fetchProfile();
    }

    // 1. Setup Location
    let watchId: number;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          if (isManuallySetRef.current) return;
          
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            const address = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            if (!isManuallySetRef.current) setLocation(prev => ({ ...prev, address, latitude: lat, longitude: lon }));
          } catch (error) {
            if (!isManuallySetRef.current) setLocation(prev => ({ ...prev, address: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`, latitude: lat, longitude: lon }));
          }
        },
        (error) => {},
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }

    // 2. Setup Voice Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
          if (!isEmergencyActive) recognition.start();
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          
          const lastWords = currentTranscript.split(' ').slice(-15).join(' ');
          const displayEl = document.getElementById('voice-transcript-display');
          if (displayEl) {
            displayEl.innerText = `Heard: "${lastWords.trim()}..."`;
          }
          
          const cleanedTranscript = currentTranscript.replace(/[^\w\s\d]/gi, '').toLowerCase();
          
          if (cleanedTranscript.includes('emergency help')) {
            handleSOSTrigger();
            recognition.stop();
          }
        };

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {
          console.error("Speech recognition error:", e);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (watchId && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isEmergencyActive]);

  const [alertId, setAlertId] = useState<string | null>(null);
  const [alertStatus, setAlertStatus] = useState<string>('ACTIVE');

  // Announce status changes via speech synthesis
  useEffect(() => {
    if (!isEmergencyActive) return;
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (alertStatus === 'DISPATCHED') {
        const msg = new SpeechSynthesisUtterance("Ambulance dispatched. Driver is approaching your location.");
        window.speechSynthesis.speak(msg);
      } else if (alertStatus === 'ARRIVED' || hasArrived) {
        const msg = new SpeechSynthesisUtterance("Ambulance arrived at your location. Please proceed outside if possible.");
        window.speechSynthesis.speak(msg);
      }
    }
  }, [alertStatus, hasArrived, isEmergencyActive]);

  // Poll for alert status updates from driver
  useEffect(() => {
    if (!isEmergencyActive || !alertId) return;
    const interval = setInterval(async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
        const res = await fetch(`http://localhost:8088/api/sos/${alertId}`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const data = await res.json();
          const newStatus = data.data?.status || data.status;
          if (newStatus && newStatus !== alertStatus) {
            setAlertStatus(newStatus);
          }
          if (newStatus === 'ARRIVED' && !hasArrived) {
            setHasArrived(true);
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isEmergencyActive, alertId, alertStatus, hasArrived]);

  async function handleSOSTrigger() {
    setIsEmergencyActive(true);
    setAlertStatus('ACTIVE');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance("Emergency request activated. Priority 1 dispatch initiated. Please stay calm.");
      msg.rate = 0.9;
      msg.pitch = 1.1;
      msg.volume = 1.0;
      window.speechSynthesis.speak(msg);
    }

    try {
      const user = getStoredUser();
      const userId = user?.id || 'user-123';
      const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
      const res = await fetch('http://localhost:8088/api/sos/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          emergencyType: 'General Emergency',
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const alertData = data.data || data;
        setAlertId(alertData.alertId || alertData.id);
        setAlertStatus(alertData.status);
        console.log("SOS Triggered successfully on backend:", alertData.alertId || alertData.id);
        fetchHistory();
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (e) {
      console.error("Failed to trigger SOS on backend:", e);
      alert("Failed to connect to the emergency dispatch network. Please ensure the backend is running.");
      setIsEmergencyActive(false);
      setAlertStatus('CANCELLED');
    }
  };

  async function handleSOSDismiss() {
    setIsEmergencyActive(false);
    setHasArrived(false);
    setAlertId(null);
    setAlertStatus('ACTIVE');
    fetchHistory();
  }

  async function handleSOSCancel() {
    setIsEmergencyActive(false);
    setHasArrived(false);
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance("Emergency request cancelled.");
      window.speechSynthesis.speak(msg);
    }

    if (alertId) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
        await fetch(`http://localhost:8088/api/sos/${alertId}/cancel`, {
          method: 'PUT',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        setAlertStatus('CANCELLED');
        fetchHistory();
      } catch (e) {
        console.error("Failed to cancel SOS:", e);
      }
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleAddContact = () => {
    setIsAddContactOpen(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to remove this emergency contact?')) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
        const res = await fetch(`http://localhost:8088/api/contacts/${id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          fetchContacts();
        }
      } catch (e) {
        console.error("Failed to delete contact:", e);
      }
    }
  };

  return (
    <div>
      {isEmergencyActive && <ActiveEmergencyBanner initialMinutes={5} hasArrived={hasArrived} />}
      
      {!isEmergencyActive && (
        <div className={`text-center mb-4 text-sm ${isListening ? 'text-green-600' : 'text-slate-500'}`}>
          {isListening ? '🎤 Voice Activation Active (Say "Emergency Help")' : '🎤 Voice Activation Unavailable'}
          <div id="voice-transcript-display" className="mt-1 italic text-slate-400 min-h-[20px]"></div>
          {isListening && <VoiceWave />}
        </div>
      )}

      <SOSButton 
        onTrigger={handleSOSTrigger} 
        onCancel={hasArrived ? handleSOSDismiss : handleSOSCancel} 
        holdDuration={3000} 
        isActive={isEmergencyActive} 
        buttonText={hasArrived ? 'Dismiss Alert' : undefined}
        hasArrived={hasArrived}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="flex flex-col gap-6">
          <PatientInfoCard patient={patient} />
          <EmergencyContacts 
            contacts={contacts} 
            onCall={handleCall} 
            onAddContact={handleAddContact} 
            onDeleteContact={handleDeleteContact}
          />
        </div>
        
        <div className="flex flex-col gap-6">
          <ResponseLog isActive={isEmergencyActive} hasArrived={hasArrived} alertStatus={alertStatus} />
          <LocationCard 
            location={location}
            isActive={isEmergencyActive} 
            alertStatus={alertStatus}
            alertId={alertId}
            onArrival={() => setHasArrived(true)}
            onLocationChange={async (lat, lng) => {
              setIsLocationManuallySet(true);
              setLocation(prev => ({ ...prev, latitude: lat, longitude: lng }));
              
              try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                setLocation(prev => ({ ...prev, address }));
              } catch (e) {}
            }}
          />
        </div>
      </div>
      
      {/* SOS History Section */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Past Emergencies</h3>
        {alertHistory.length === 0 ? (
          <p className="text-slate-500 text-sm">No emergency history found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {alertHistory.map((alert, i) => (
              <div key={alert.id || i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-700">{alert.emergencyType || 'General Emergency'}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(alert.triggeredAt).toLocaleString()}
                  </div>
                </div>
                <div className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
                  alert.status === 'ACTIVE' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {alert.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddContactDialog 
        isOpen={isAddContactOpen} 
        onClose={() => setIsAddContactOpen(false)} 
        onAdd={async (newContact) => {
          try {
            const user = getStoredUser();
            const userId = user?.id || 'user-123';
            const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
            const res = await fetch(`http://localhost:8088/api/contacts?userId=${userId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(newContact)
            });
            if (res.ok) fetchContacts();
          } catch(e) { console.error("Failed to add contact", e); }
        }} 
      />

    </div>
  );
};
