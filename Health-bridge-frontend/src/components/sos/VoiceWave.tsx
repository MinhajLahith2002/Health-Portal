"use client";

import React, { useEffect, useRef, useState } from 'react';

export const VoiceWave: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasMicAccess, setHasMicAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let animationFrameId: number;

    const startAudioVisualizer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicAccess(true);
        
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const draw = () => {
          const WIDTH = canvas.width;
          const HEIGHT = canvas.height;
          
          animationFrameId = requestAnimationFrame(draw);
          
          analyser.getByteFrequencyData(dataArray);
          
          canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
          
          // Draw wave bars
          const barWidth = (WIDTH / bufferLength) * 2.5;
          let barHeight;
          let x = 0;
          
          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2; // scale down a bit
            
            // Dynamic color based on frequency
            const r = barHeight + 25 * (i / bufferLength);
            const g = 163; // 16A34A base green (16, 163, 74)
            const b = 74;
            
            canvasCtx.fillStyle = `rgba(22, 163, 74, ${Math.max(0.2, barHeight/100)})`;
            
            // Center the bars vertically
            canvasCtx.fillRect(x, HEIGHT / 2 - barHeight / 2, barWidth, barHeight);
            
            x += barWidth + 1;
          }
        };
        
        draw();
      } catch (err) {
        console.error("Microphone access denied or failed", err);
        setHasMicAccess(false);
      }
    };

    startAudioVisualizer();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px' }}>
      {hasMicAccess === false && (
        <span style={{ fontSize: '11px', color: '#EF4444' }}>Please allow microphone permissions</span>
      )}
      <canvas 
        ref={canvasRef} 
        width="200" 
        height="40" 
        style={{ 
          width: '200px', 
          height: '40px', 
          opacity: hasMicAccess ? 1 : 0.3 
        }} 
      />
    </div>
  );
};
