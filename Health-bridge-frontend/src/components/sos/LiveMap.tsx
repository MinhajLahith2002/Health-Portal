"use client";

import React, { useEffect, useState } from 'react';
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

// Realistic Top-Down Ambulance SVG with flashing siren lights
const ambulanceSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200" width="30" height="60">
  <rect x="10" y="10" width="80" height="180" rx="15" fill="#f8f9fa" stroke="#ced4da" stroke-width="2"/>
  <rect x="25" y="40" width="50" height="25" rx="5" fill="#212529" opacity="0.8"/>
  <path d="M 15 80 L 85 80 L 85 180 L 15 180 Z" fill="#ffffff" stroke="#e9ecef" stroke-width="1"/>
  <rect x="40" y="100" width="20" height="60" fill="#dc3545"/>
  <rect x="20" y="120" width="60" height="20" fill="#dc3545"/>
  <!-- Sirens -->
  <rect x="25" y="5" width="15" height="10" rx="2" fill="#dc3545">
    <animate attributeName="fill" values="#dc3545;#ffcccc;#dc3545" dur="0.4s" repeatCount="indefinite"/>
  </rect>
  <rect x="60" y="5" width="15" height="10" rx="2" fill="#0d6efd">
    <animate attributeName="fill" values="#0d6efd;#ccccff;#0d6efd" dur="0.4s" repeatCount="indefinite"/>
  </rect>
</svg>`;

// Function to generate rotated ambulance icon
const getAmbulanceIcon = (angle: number) => L.divIcon({
  html: `<div style="transform: rotate(${angle}deg); filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.4)); transition: transform 0.5s ease; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
          ${ambulanceSVG}
         </div>`,
  className: 'ambulance-realistic-icon',
  iconSize: [30, 60],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface LiveMapProps {
  patientLat: number;
  patientLng: number;
  isActive?: boolean;
  alertStatus?: string;
  alertId?: string | null;
  onLocationChange?: (lat: number, lng: number) => void;
  onArrival?: () => void;
  onProgress?: (distanceKm: number, timeMins: number) => void;
}

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

export default function LiveMap({ patientLat, patientLng, isActive = false, alertStatus = 'ACTIVE', alertId = null, onLocationChange, onArrival, onProgress }: LiveMapProps) {
  const [ambulanceLat, setAmbulanceLat] = useState<number | null>(null);
  const [ambulanceLng, setAmbulanceLng] = useState<number | null>(null);
  const [ambulanceAngle, setAmbulanceAngle] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);

  // Use a ref to track previous location to calculate angle
  const prevLocRef = React.useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!isActive || alertStatus !== 'DISPATCHED' || !alertId) {
      if (!isActive) {
        setHasArrived(false);
        setAmbulanceLat(null);
        setAmbulanceLng(null);
        prevLocRef.current = null;
      }
      return;
    }

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8088/ws/alerts'),
      debug: function (str) {
        // console.log(str);
      },
      onConnect: () => {
        stompClient.subscribe('/topic/driver/location', (msg) => {
          if (msg.body) {
            const data = JSON.parse(msg.body);
            // Only update if it's for our alert
            if (data.alertId === alertId) {
              const { lat: currentLat, lng: currentLng } = data;
              
              let angle = 0;
              if (prevLocRef.current) {
                const moveDx = currentLng - prevLocRef.current.lng;
                const moveDy = currentLat - prevLocRef.current.lat;
                // Only update angle if there's significant movement
                if (Math.abs(moveDx) > 0.0001 || Math.abs(moveDy) > 0.0001) {
                  angle = Math.atan2(moveDx, moveDy) * (180 / Math.PI);
                } else {
                  setAmbulanceAngle(prev => prev); // keep old angle
                }
              }
              
              if (angle !== 0) setAmbulanceAngle(angle);
              setAmbulanceLat(currentLat);
              setAmbulanceLng(currentLng);
              prevLocRef.current = { lat: currentLat, lng: currentLng };
              
              const distKm = getDistanceFromLatLonInKm(currentLat, currentLng, patientLat, patientLng);
              
              if (distKm < 0.05) { // arrived if < 50 meters
                setHasArrived(true);
                if (onArrival) onArrival();
              } else {
                if (onProgress) {
                  // Assume average speed 40km/h = 1.5 mins per km, or use data.speed if available
                  let speedKmH = 40;
                  if (data.speed && data.speed > 0) speedKmH = data.speed * 3.6; 
                  let timeMins = (distKm / speedKmH) * 60;
                  onProgress(distKm, timeMins);
                }
              }
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      }
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [patientLat, patientLng, isActive, alertStatus, alertId, onArrival, onProgress]);

  // Add a slight offset to the ambulance rendering position if it exactly overlaps the patient
  let renderAmbulanceLng = ambulanceLng;
  if (ambulanceLat !== null && ambulanceLng !== null) {
    const isOverlap = Math.abs(ambulanceLat - patientLat) < 0.0001 && Math.abs(ambulanceLng - patientLng) < 0.0001;
    if (isOverlap) {
      renderAmbulanceLng = ambulanceLng + 0.0002;
    }
  }

  return (
    <MapContainer center={[patientLat, patientLng]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <MapUpdater lat={patientLat} lng={patientLng} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Marker 
        draggable={!!onLocationChange}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const pos = marker.getLatLng();
            if (onLocationChange) {
              onLocationChange(pos.lat, pos.lng);
            }
          }
        }}
        position={[patientLat, patientLng]}
      >
        <Popup>Drag to adjust your exact location</Popup>
      </Marker>
      {isActive && ambulanceLat !== null && renderAmbulanceLng !== null && (
        <Marker position={[ambulanceLat, renderAmbulanceLng]} icon={getAmbulanceIcon(ambulanceAngle)}>
          <Popup>Incoming Ambulance 🚑</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
