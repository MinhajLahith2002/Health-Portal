"use client";

import React, { useState, useRef, useEffect } from 'react';

import { SOSButtonAnimation } from './SOSButtonAnimation';

interface SOSButtonProps {
  onTrigger: () => void;
  onCancel?: () => void;
  holdDuration?: number; // in milliseconds
  isActive?: boolean;
  buttonText?: string;
  hasArrived?: boolean;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ 
  onTrigger, 
  onCancel,
  holdDuration = 3000,
  isActive = false,
  buttonText,
  hasArrived = false
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(isActive);

  useEffect(() => {
    setIsTriggered(isActive);
    if (!isActive) {
      setProgress(0);
    }
  }, [isActive]);
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimers = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent default to avoid selection issues
    e.preventDefault();
    if (isTriggered) return;

    vibrate(50); // Short haptic feedback on press
    setIsHolding(true);
    startTimeRef.current = Date.now();
    
    // Start progress animation
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(elapsed / holdDuration, 1);
      setProgress(newProgress);
    }, 16); // ~60fps

    // Set trigger timer
    holdTimerRef.current = setTimeout(() => {
      clearTimers();
      setIsHolding(false);
      setProgress(1);
      setIsTriggered(true);
      vibrate([100, 50, 100, 50, 200]); // Distinct success pattern
      onTrigger();
    }, holdDuration);
  };

  const handlePointerUpOrLeave = () => {
    if (isTriggered) return;
    
    clearTimers();
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div 
        className="relative w-40 h-40 flex items-center justify-center mb-4 select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
      >
        <SOSButtonAnimation progress={progress} />
        <button 
          className={`w-[120px] h-[120px] rounded-full text-white border-0 flex flex-col items-center justify-center cursor-pointer z-10 transition-all duration-200 outline-none ${hasArrived ? 'bg-green-700 shadow-[0_4px_12px_rgba(21,128,61,0.4)]' : isTriggered ? 'bg-green-600 shadow-[0_4px_12px_rgba(22,163,74,0.4)]' : isHolding ? 'bg-red-600 scale-95 shadow-[0_4px_12px_rgba(239,68,68,0.4)]' : 'bg-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.4)]'}`}
          aria-label="Emergency SOS"
        >
          <div className="text-2xl font-extrabold leading-none mb-1">{hasArrived ? '✓' : '🚨'} SOS</div>
          <div className="text-xs font-medium opacity-90 text-center max-w-[80px]">
            {hasArrived ? 'RESOLVED' : isTriggered ? 'ACTIVE' : 'Hold for 3 seconds'}
          </div>
        </button>
      </div>
      {!isTriggered ? (
        <p className="text-[13px] text-slate-500 text-center max-w-[240px] leading-relaxed">
          Press and hold to prevent accidental emergency requests.
        </p>
      ) : (
        <button
          onClick={() => {
            setIsTriggered(false);
            setProgress(0);
            if (onCancel) onCancel();
          }}
          style={{
            marginTop: '24px',
            padding: '12px 32px',
            backgroundColor: '#F1F5F9',
            color: '#DC2626',
            border: '2px solid #DC2626',
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          {buttonText || 'Cancel Emergency'}
        </button>
      )}
    </div>
  );
};
