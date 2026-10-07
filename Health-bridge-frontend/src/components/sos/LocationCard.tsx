import React from 'react';
import dynamic from 'next/dynamic';

import { LocationInfo } from '../../types/emergency';

const LiveMap = dynamic(() => import('./LiveMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' }}>Loading map...</div>
});

interface LocationCardProps {
  location: LocationInfo;
  isActive?: boolean;
  alertStatus?: string;
  alertId?: string | null;
  onLocationChange?: (lat: number, lng: number) => void;
  onArrival?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, isActive = false, alertStatus = 'ACTIVE', alertId = null, onLocationChange, onArrival }) => {
  const [ambulanceArrived, setAmbulanceArrived] = React.useState(false);
  const [liveDistanceKm, setLiveDistanceKm] = React.useState<number | null>(null);
  const [liveTimeMins, setLiveTimeMins] = React.useState<number | null>(null);

  // Reset tracking states if emergency is cancelled
  React.useEffect(() => {
    if (!isActive) {
      setAmbulanceArrived(false);
      setLiveDistanceKm(null);
      setLiveTimeMins(null);
    }
  }, [isActive]);
  
  const handleArrival = React.useCallback(() => {
    setAmbulanceArrived(true);
    if (onArrival) onArrival();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance("The ambulance has arrived at your location.");
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    }
  }, [onArrival]);

  const handleProgress = React.useCallback((dist: number, time: number) => {
    setLiveDistanceKm(dist);
    setLiveTimeMins(time);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">📍 Current Location</h3>
      </div>
      <p className="text-sm text-slate-800 mb-3">{location.address}</p>
      
      {!isActive && (
        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '-8px', marginBottom: '16px' }}>
          If this location is wrong, drag the pin on the map to correct it.
        </p>
      )}
      
      {isActive && !ambulanceArrived && liveDistanceKm !== null && liveTimeMins !== null && (
        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-2 rounded-lg" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span role="img" aria-label="ambulance">🚑</span>
            <span className="text-base font-bold text-green-600 m-0">
              EST. ARRIVAL: {Math.ceil(liveTimeMins)} mins
            </span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>
            {liveDistanceKm.toFixed(2)} km away
          </div>
        </div>
      )}

      {isActive && ambulanceArrived && (
        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-2 rounded-lg" style={{ backgroundColor: '#DC2626', color: 'white', fontWeight: 'bold' }}>
          <span role="img" aria-label="siren">🚨</span>
          <span>AMBULANCE HAS ARRIVED</span>
        </div>
      )}

      {location.latitude && location.longitude && (
        <div className="h-[200px] w-full rounded-lg mt-3 overflow-hidden relative z-[1]">
          <LiveMap 
            patientLat={location.latitude} 
            patientLng={location.longitude} 
            isActive={isActive}
            alertStatus={alertStatus}
            alertId={alertId}
            onLocationChange={isActive ? undefined : onLocationChange} // Disable dragging when active
            onArrival={handleArrival}
            onProgress={handleProgress}
          />
        </div>
      )}
    </div>
  );
};
