import React, { useState, useEffect } from 'react';

interface ActiveEmergencyBannerProps {
  initialMinutes?: number;
  hasArrived?: boolean;
}

export const ActiveEmergencyBanner: React.FC<ActiveEmergencyBannerProps> = ({ initialMinutes = 5, hasArrived = false }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0 || hasArrived) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, hasArrived]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div style={{
      backgroundColor: hasArrived ? '#15803D' : '#B91C1C', // Green if arrived, red if active
      color: 'white',
      borderRadius: '8px',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      boxShadow: hasArrived ? '0 4px 6px -1px rgba(21, 128, 61, 0.4)' : '0 4px 6px -1px rgba(185, 28, 28, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          {hasArrived ? '✓' : '!'}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            {hasArrived ? 'AMBULANCE ARRIVED' : 'EMERGENCY REQUEST ACTIVE'}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginTop: '4px' }}>
            {hasArrived ? 'Please proceed to the vehicle safely' : 'Priority 1 Dispatch Initiated'}
          </p>
        </div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          {hasArrived ? '00:00' : formattedTime}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>
          Estimated Arrival (Min)
        </div>
      </div>
    </div>
  );
};
