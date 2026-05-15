import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color, width = 100, height = 32 }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height * 0.8 - height * 0.1;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  trend?: 'up' | 'down' | 'neutral';
  accent?: boolean;
  sparkline?: number[];
  bgIcon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  icon, label, value, subtext, trend = 'neutral', accent, sparkline, bgIcon,
}) => {
  const trendColor = trend === 'up' ? '#4CAF82' : trend === 'down' ? '#E05C5C' : 'var(--color-text-muted)';
  const [displayed, setDisplayed] = useState('0');
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animate number on mount
  useEffect(() => {
    const numMatch = value.replace(/[^\d]/g, '');
    if (!numMatch) { setDisplayed(value); return; }
    const target = parseInt(numMatch, 10);
    const start = Date.now();
    const duration = 700;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplayed(value.replace(numMatch, current.toLocaleString('es-CO')));
      if (progress < 1) animRef.current = setTimeout(tick, 16);
    };
    tick();
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [value]);

  return (
    <div className="card-glass" style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      {/* Background icon decoration */}
      {bgIcon && (
        <div style={{
          position: 'absolute', top: 12, right: 14,
          opacity: 0.08, transform: 'scale(2.8)', transformOrigin: 'top right',
          color: accent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          pointerEvents: 'none',
        }}>
          {bgIcon}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          backgroundColor: accent ? 'rgba(76,175,130,0.2)' : 'var(--color-surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
          flexShrink: 0, border: '1px solid',
          borderColor: accent ? 'rgba(76,175,130,0.3)' : 'var(--color-border)',
        }}>
          {icon}
        </div>
        {trend !== 'neutral' && (
          <span style={{ color: trendColor, display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', fontWeight: 700 }}>
            {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </p>
      <p className="tabular animate-count-up" style={{
        fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.025em',
        color: 'var(--color-text-primary)', lineHeight: 1.1, marginBottom: 6,
      }}>
        {displayed}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.75rem', color: trend !== 'neutral' ? trendColor : 'var(--color-text-muted)' }}>
          {subtext}
        </p>
        {sparkline && sparkline.length >= 2 && (
          <Sparkline data={sparkline} color={accent ? '#4CAF82' : '#8B92B8'} />
        )}
      </div>
    </div>
  );
};
