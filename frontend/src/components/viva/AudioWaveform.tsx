import React, { useEffect, useRef } from 'react';
import { VivaExaminerState } from '../../types';

interface AudioWaveformProps {
  state: VivaExaminerState;
  fftSize?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ state, fftSize = 64 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const barCount = 28;

    const render = () => {
      animationId = requestAnimationFrame(render);
      phase += 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Color scheme according to state
      let primaryColor = '#38bdf8'; // Cyan default
      if (state === 'SPEAKING') primaryColor = '#f59e0b'; // Amber speaking
      if (state === 'LISTENING') primaryColor = '#10b981'; // Emerald listening
      if (state === 'EVALUATING') primaryColor = '#a855f7'; // Purple evaluating

      ctx.fillStyle = primaryColor;

      // Dynamic animated bars
      const barWidth = Math.floor(width / (barCount * 1.5));
      const spacing = Math.floor(barWidth * 0.5);

      for (let i = 0; i < barCount; i++) {
        let barHeight = 6;

        if (state === 'SPEAKING') {
          // Dynamic harmonic sine pulses for speech
          const wave1 = Math.sin(phase * 1.8 + i * 0.4);
          const wave2 = Math.cos(phase * 2.4 + i * 0.6);
          barHeight = Math.max(8, Math.abs(wave1 + wave2) * (height * 0.42));
        } else if (state === 'LISTENING') {
          // Reactive waveform responding to student speech
          const wave = Math.sin(phase * 2.2 + i * 0.5);
          barHeight = Math.max(6, Math.abs(wave) * (height * 0.38));
        } else if (state === 'EVALUATING') {
          // Rotating undulating pulse
          const wave = Math.sin(phase * 3.0 + i * 0.2);
          barHeight = Math.max(4, Math.abs(wave) * (height * 0.25));
        } else {
          // IDLE state: gentle subtle sine breathing
          barHeight = 6 + Math.sin(phase * 0.8 + i * 0.25) * 4;
        }

        const x = i * (barWidth + spacing) + spacing;
        const y = centerY - barHeight / 2;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, fftSize]);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-[#0b1120] border border-slate-800 rounded-xl">
      <canvas
        ref={canvasRef}
        width={340}
        height={90}
        className="w-full h-[90px] rounded-lg"
      />
      <div className="mt-2 flex items-center space-x-2 text-xs font-mono">
        <span
          className={`w-2 h-2 rounded-full ${
            state === 'SPEAKING'
              ? 'bg-amber-400 animate-ping'
              : state === 'LISTENING'
              ? 'bg-emerald-400 animate-pulse'
              : state === 'EVALUATING'
              ? 'bg-purple-400 animate-spin'
              : 'bg-blue-400'
          }`}
        />
        <span className="text-slate-300 font-semibold uppercase tracking-wider">
          Examiner: {state}
        </span>
      </div>
    </div>
  );
};
