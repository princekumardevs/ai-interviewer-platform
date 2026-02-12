'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  /** Whether the mic is currently active */
  isActive: boolean;
  /** Number of bars in the visualizer */
  barCount?: number;
  /** Height in pixels */
  height?: number;
  /** Color of the bars (CSS color) */
  color?: string;
  /** Additional className */
  className?: string;
}

export function AudioVisualizer({
  isActive,
  barCount = 5,
  height = 32,
  color = 'hsl(var(--primary))',
  className = '',
}: AudioVisualizerProps) {
  const [levels, setLevels] = useState<number[]>(
    Array(barCount).fill(0)
  );
  const animRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!isActive) {
      setLevels(Array(barCount).fill(0));
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      return;
    }

    let cancelled = false;

    async function startAnalyser() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(dataArray);

          // Map frequency bins to bar levels
          const binSize = Math.floor(dataArray.length / barCount);
          const newLevels = Array(barCount)
            .fill(0)
            .map((_, i) => {
              let sum = 0;
              for (let j = 0; j < binSize; j++) {
                sum += dataArray[i * binSize + j];
              }
              return sum / binSize / 255; // normalize 0-1
            });

          setLevels(newLevels);
          animRef.current = requestAnimationFrame(tick);
        }

        tick();
      } catch {
        // Mic permission denied or no mic — show flat bars
        setLevels(Array(barCount).fill(0));
      }
    }

    startAnalyser();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [isActive, barCount]);

  return (
    <div
      className={`flex items-end justify-center gap-1 ${className}`}
      style={{ height }}
    >
      {levels.map((level, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-75"
          style={{
            width: 4,
            height: Math.max(4, level * height),
            backgroundColor: isActive ? color : 'hsl(var(--muted-foreground) / 0.3)',
          }}
        />
      ))}
    </div>
  );
}
