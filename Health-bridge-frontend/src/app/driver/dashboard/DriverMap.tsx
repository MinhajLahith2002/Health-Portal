"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Realistic Top-Down Ambulance SVG
const ambulanceSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200" width="30" height="60">
  <rect x="10" y="10" width="80" height="180" rx="15" fill="#f8f9fa" stroke="#ced4da" stroke-width="2"/>
  <rect x="25" y="40" width="50" height="25" rx="5" fill="#212529" opacity="0.8"/>
  <path d="M 15 80 L 85 80 L 85 180 L 15 180 Z" fill="#ffffff" stroke="#e9ecef" stroke-width="1"/>
  <rect x="40" y="100" width="20" height="60" fill="#dc3545"/>
  <rect x="20" y="120" width="60" height="20" fill="#dc3545"/>
  <rect x="25" y="5" width="15" height="10" rx="2" fill="#dc3545">
    <animate attributeName="fill" values="#dc3545;#ffcccc;#dc3545" dur="0.4s" repeatCount="indefinite"/>
  </rect>
  <rect x="60" y="5" width="15" height="10" rx="2" fill="#0d6efd">
    <animate attributeName="fill" values="#0d6efd;#ccccff;#0d6efd" dur="0.4s" repeatCount="indefinite"/>
  </rect>
</svg>`;

const getAmbulanceIcon = () => L.divIcon({
  html: `<div style="filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.4)); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
          ${ambulanceSVG}
         </div>`,
  className: 'ambulance-realistic-icon',
  iconSize: [30, 60],
  iconAnchor: [15, 30],
});

// Create red marker for patient
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Auto-center map to driver's location
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface DriverMapProps {
  driverLat: number;
  driverLng: number;
  patientLat?: number | null;
  patientLng?: number | null;
}

export default function DriverMap({ driverLat, driverLng, patientLat, patientLng }: DriverMapProps) {
  // Add slight offset if coordinates are identical to prevent overlap hiding one marker
  const isOverlap = patientLat != null && patientLng != null && Math.abs(driverLat - patientLat) < 0.0001 && Math.abs(driverLng - patientLng) < 0.0001;
  const renderDriverLng = isOverlap ? driverLng + 0.0002 : driverLng;

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', zIndex: 0 }}>
      <MapContainer 
        center={[driverLat, driverLng]} 
        zoom={15} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapUpdater center={[driverLat, driverLng]} />
        
        {/* Driver Marker */}
        <Marker position={[driverLat, renderDriverLng]} icon={getAmbulanceIcon()}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Patient Marker */}
        {patientLat != null && patientLng != null && (
          <Marker position={[patientLat, patientLng]} icon={redIcon}>
            <Popup><strong>Emergency Location</strong></Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
