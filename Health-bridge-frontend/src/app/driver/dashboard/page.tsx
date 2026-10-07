"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, StopCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const DriverMap = dynamic(() => import('./DriverMap'), { 
  ssr: false, 
  loading: () => <div style={{ height: '300px', backgroundColor: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div> 
});

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
}

export default function DriverDashboard() {
  const [isDispatchActive, setIsDispatchActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [defaultLocation, setDefaultLocation] = useState<{lat: number, lng: number} | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [pendingAlert, setPendingAlert] = useState<any>(null);
  const [cancelledMessage, setCancelledMessage] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDefaultLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.error("Initial GPS Error:", error.message),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 10));
  };

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8088/ws/alerts'),
      debug: function (str) {
        // console.log(str);
      },
      onConnect: () => {
        addLog("Connected to emergency dispatch network.");
        
        stompClient.subscribe('/topic/alerts', (msg) => {
          if (msg.body) {
            const alert = JSON.parse(msg.body);
            setPendingAlert(alert);
            setCancelledMessage(null);
            addLog(`New SOS Alert received: ${alert.id}`);
            
            // Audio alert
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance("Emergency dispatch received.");
              window.speechSynthesis.speak(utterance);
            }
          }
        });

        stompClient.subscribe('/topic/alerts/cancel', (msg) => {
          if (msg.body) {
            const alert = JSON.parse(msg.body);
            setPendingAlert((currentAlert: any) => {
              if (currentAlert && currentAlert.id === alert.id) {
                const cancelText = `Alert #${alert.id.slice(-4).toUpperCase()} was cancelled by patient.`;
                addLog(cancelText);
                setCancelledMessage(cancelText);
                
                // Audio alert
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance("Emergency dispatch cancelled by patient.");
                  window.speechSynthesis.speak(utterance);
                }
                
                // Stop tracking if active
                if (watchIdRef.current !== null) {
                  navigator.geolocation.clearWatch(watchIdRef.current);
                  watchIdRef.current = null;
                }
                setIsDispatchActive(false);
                setCurrentLocation(null);
                
                return null;
              }
              return currentAlert;
            });
          }
        });
      },
      onStompError: (frame) => {
        addLog('Broker reported error: ' + frame.headers['message']);
      }
    });

    stompClientRef.current = stompClient;
    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const startTracking = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      addLog("Error: Geolocation is not supported by your browser");
      return;
    }

    setIsDispatchActive(true);
    addLog("Dispatch accepted. Starting GPS tracker...");

    if (pendingAlert?.id) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
      fetch(`http://localhost:8088/api/sos/${pendingAlert.id}/dispatch`, { 
        method: 'PUT',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      }).catch(err => addLog(`Failed to notify dispatch: ${err}`));
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude, accuracy, speed });
        
        if (stompClientRef.current && stompClientRef.current.connected && pendingAlert?.id) {
          stompClientRef.current.publish({
            destination: '/app/driver/location',
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
              accuracy: accuracy,
              speed: speed || 0,
              driverId: 'driver-123',
              alertId: pendingAlert.id
            })
          });
        }
      },
      (error) => {
        addLog(`GPS Error: ${error.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (pendingAlert?.id) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('healthbridge_token') : null;
      fetch(`http://localhost:8088/api/sos/${pendingAlert.id}/arrive`, { 
        method: 'PUT',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      }).catch(err => addLog(`Failed to notify arrival: ${err}`));
    }

    setIsDispatchActive(false);
    setCurrentLocation(null);
    setPendingAlert(null); // Clear the alert once resolved
    addLog("Dispatch ended. Tracking stopped.");
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Periodic heartbeat so late subscribers get the location even if the driver is stationary
  useEffect(() => {
    if (!isDispatchActive || !currentLocation || !pendingAlert?.id || !stompClientRef.current?.connected) return;
    
    const interval = setInterval(() => {
      stompClientRef.current?.publish({
        destination: '/app/driver/location',
        body: JSON.stringify({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: currentLocation.accuracy,
          speed: currentLocation.speed || 0,
          driverId: 'driver-123',
          alertId: pendingAlert.id
        })
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isDispatchActive, currentLocation, pendingAlert]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen bg-white text-slate-900 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Ambulance Driver Portal</h1>
        <p className="text-slate-500">HealthBridge Emergency Network</p>
      </header>

      {/* Active Emergency Info Card */}
      {pendingAlert ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Pending Dispatch #{pendingAlert.id?.slice(-4).toUpperCase() || 'NEW'}</h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide">Priority 1</span>
          </div>
          <p className="text-sm md:text-base text-slate-600 mb-2"><strong>Patient:</strong> {pendingAlert.patientInfo?.name && pendingAlert.patientInfo.name !== 'null null' ? pendingAlert.patientInfo.name : 'Unknown'}</p>
          <p className="text-sm md:text-base text-slate-600 mb-2"><strong>Emergency Type:</strong> {pendingAlert.emergencyType || 'Critical'}</p>
          <p className="text-sm md:text-base text-slate-600 mb-2"><strong>Medical History:</strong> {pendingAlert.patientInfo?.conditions?.length > 0 ? pendingAlert.patientInfo.conditions.join(', ') : 'None reported'}</p>
          <p className="text-sm md:text-base text-slate-600 mb-2"><strong>Allergies:</strong> {pendingAlert.patientInfo?.allergies?.length > 0 ? pendingAlert.patientInfo.allergies.join(', ') : 'None reported'}</p>
          <p className="text-sm md:text-base text-slate-600"><strong>Address:</strong> {pendingAlert.location?.address || 'GPS Location'}</p>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-6 mb-6 text-center">
          {cancelledMessage ? (
            <p className="text-red-600 font-bold">{cancelledMessage}</p>
          ) : (
            <p className="text-slate-500">No pending dispatch. Waiting for alerts...</p>
          )}
        </div>
      )}

      {/* Main Action Area */}
      <div className="flex flex-col gap-4 mb-8">
        {!isDispatchActive ? (
          <button 
            onClick={startTracking}
            disabled={!pendingAlert}
            className={`w-full p-4 rounded-xl text-lg md:text-xl font-bold flex items-center justify-center gap-3 transition-all ${
              pendingAlert 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_6px_-1px_rgba(37,99,235,0.4)] cursor-pointer' 
                : 'bg-slate-400 text-white cursor-not-allowed'
            }`}
          >
            <Navigation size={24} />
            Accept Dispatch & Start Tracking
          </button>
        ) : (
          <button 
            onClick={stopTracking}
            className="w-full p-4 rounded-xl text-lg md:text-xl font-bold flex items-center justify-center gap-3 bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_6px_-1px_rgba(220,38,38,0.4)] transition-all"
          >
            <StopCircle size={24} />
            Arrived / End Tracking
          </button>
        )}
      </div>

      {/* Live Telemetry Display */}
      {isDispatchActive && (
        <div className="bg-emerald-50 border border-emerald-500 rounded-xl p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-600">
            <MapPin size={20} />
            <h3 className="text-base font-semibold">Live Telemetry Active</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Latitude</p>
              <p className="text-lg font-bold text-slate-900 font-mono">{currentLocation?.lat.toFixed(6) || '---'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Longitude</p>
              <p className="text-lg font-bold text-slate-900 font-mono">{currentLocation?.lng.toFixed(6) || '---'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Accuracy</p>
              <p className="text-lg font-bold text-slate-900">{currentLocation ? `±${Math.round(currentLocation.accuracy)}m` : '---'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Speed</p>
              <p className="text-lg font-bold text-slate-900">{currentLocation?.speed ? `${Math.round(currentLocation.speed * 3.6)} km/h` : '0 km/h'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Map */}
      {(currentLocation || defaultLocation) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase">Live Route Map</h3>
          <DriverMap 
            driverLat={currentLocation?.lat || defaultLocation!.lat} 
            driverLng={currentLocation?.lng || defaultLocation!.lng} 
            patientLat={pendingAlert ? (pendingAlert.location?.latitude || 6.9271) : null} 
            patientLng={pendingAlert ? (pendingAlert.location?.longitude || 79.8612) : null} 
          />
        </div>
      )}

      {/* System Logs */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase">Transmission Logs</h3>
        <div className="bg-slate-900 text-sky-400 p-4 rounded-xl font-mono text-xs min-h-[150px] flex flex-col gap-2 overflow-y-auto">
          {logs.length === 0 ? (
            <span className="text-slate-500">System idle. Waiting for dispatch...</span>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ opacity: 1 - (i * 0.1) }}>{log}</div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
