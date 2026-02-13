'use client';

import React from 'react';

interface RadarChartProps {
  scores: {
    label: string;
    value: number; // 0-100
  }[];
  size?: number;
}

export function RadarChart({ scores, size = 280 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 40; // Leave room for labels
  const levels = 4; // Concentric rings (25, 50, 75, 100)
  const angleStep = (2 * Math.PI) / scores.length;

  // Get point on the chart for a given index and value (0-100)
  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2; // Start from top
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build the filled polygon path
  const dataPoints = scores.map((s, i) => getPoint(i, s.value));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Score color
  const avgScore = scores.reduce((sum, s) => sum + s.value, 0) / scores.length;
  const fillColor = avgScore >= 76 ? '#22c55e' : avgScore >= 51 ? '#eab308' : avgScore >= 26 ? '#f97316' : '#ef4444';
  const strokeColor = avgScore >= 76 ? '#16a34a' : avgScore >= 51 ? '#ca8a04' : avgScore >= 26 ? '#ea580c' : '#dc2626';

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric level rings */}
        {Array.from({ length: levels }, (_, level) => {
          const levelRadius = ((level + 1) / levels) * radius;
          const points = scores
            .map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted-foreground/20"
            />
          );
        })}

        {/* Axis lines from center to each vertex */}
        {scores.map((_, i) => {
          const point = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted-foreground/20"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill={fillColor}
          fillOpacity={0.2}
          stroke={strokeColor}
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={strokeColor}
          />
        ))}

        {/* Labels */}
        {scores.map((s, i) => {
          const labelPoint = getPoint(i, 120); // Push labels outside the chart
          const isTop = i === 0;
          const isBottom = scores.length === 4 && i === 2;
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline={isTop ? 'auto' : isBottom ? 'hanging' : 'middle'}
              className="fill-muted-foreground text-[11px] font-medium"
            >
              {s.label}
            </text>
          );
        })}

        {/* Score values next to dots */}
        {dataPoints.map((p, i) => (
          <text
            key={`val-${i}`}
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-bold"
          >
            {scores[i].value}
          </text>
        ))}
      </svg>
    </div>
  );
}
