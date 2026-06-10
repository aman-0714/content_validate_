import React, { useEffect, useRef, useState } from 'react';

// Tier config: colors, labels, glows
const getTier = (s) => {
  if (s >= 75) return {
    stroke: '#34d399', glow: 'rgba(52,211,153,0.55)',
    text: '#34d399', badge: 'rgba(52,211,153,0.12)',
    badgeBorder: 'rgba(52,211,153,0.3)', badgeText: '#6ee7b7',
    label: 'Excellent', pulse: '#34d399',
  };
  if (s >= 55) return {
    stroke: '#818cf8', glow: 'rgba(129,140,248,0.55)',
    text: '#818cf8', badge: 'rgba(129,140,248,0.12)',
    badgeBorder: 'rgba(129,140,248,0.3)', badgeText: '#a5b4fc',
    label: 'Good', pulse: '#818cf8',
  };
  if (s >= 35) return {
    stroke: '#fbbf24', glow: 'rgba(251,191,36,0.55)',
    text: '#fbbf24', badge: 'rgba(251,191,36,0.12)',
    badgeBorder: 'rgba(251,191,36,0.3)', badgeText: '#fde68a',
    label: 'Average', pulse: '#fbbf24',
  };
  return {
    stroke: '#f87171', glow: 'rgba(248,113,113,0.55)',
    text: '#f87171', badge: 'rgba(248,113,113,0.12)',
    badgeBorder: 'rgba(248,113,113,0.3)', badgeText: '#fca5a5',
    label: 'Low', pulse: '#f87171',
  };
};

const ScoreCard = ({ label, score, icon, description }) => {
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  const tier = getTier(score);

  // Intersection observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Count-up
  useEffect(() => {
    if (!visible) return;
    let v = 0;
    const dur = 1100;
    const tick = 14;
    const inc = score / (dur / tick);
    const t = setInterval(() => {
      v += inc;
      if (v >= score) { setDisplay(score); clearInterval(t); }
      else setDisplay(Math.round(v));
    }, tick);
    return () => clearInterval(t);
  }, [visible, score]);

  // Ring math
  const SIZE = 88;
  const SW = 7;
  const R = (SIZE - SW) / 2;
  const CIRC = 2 * Math.PI * R;
  const offset = visible ? ((100 - display) / 100) * CIRC : CIRC;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 20,
        padding: '18px 18px 16px',
        background: 'linear-gradient(145deg, #0f1117 0%, #0a0c12 100%)',
        border: `1px solid ${hovered ? tier.stroke + '44' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered
          ? `0 0 0 1px ${tier.stroke}22, 0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${tier.glow.replace('0.55','0.12')}`
          : '0 2px 12px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Top-right ambient glow blob */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: tier.glow.replace('0.55', hovered ? '0.08' : '0.04'),
        pointerEvents: 'none',
        transition: 'background 0.3s',
      }} />

      {/* Header row: label + icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#6b7280',
          }}>{label}</span>
        </div>
        {/* Tier badge */}
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
          textTransform: 'uppercase', padding: '3px 8px', borderRadius: 99,
          background: tier.badge, border: `1px solid ${tier.badgeBorder}`,
          color: tier.badgeText,
        }}>{tier.label}</span>
      </div>

      {/* Ring + description row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* SVG Ring */}
        <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
          <svg
            width={SIZE} height={SIZE}
            style={{ transform: 'rotate(-90deg)', display: 'block' }}
          >
            {/* Track */}
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={SW}
            />
            {/* Glow duplicate (blurred effect via filter) */}
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke={tier.stroke}
              strokeWidth={SW + 4} strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={offset}
              style={{
                opacity: 0.18,
                filter: 'blur(4px)',
                transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
            {/* Main arc */}
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke={tier.stroke}
              strokeWidth={SW} strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={offset}
              style={{
                filter: `drop-shadow(0 0 5px ${tier.glow})`,
                transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </svg>
          {/* Center: score */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 24, fontWeight: 900, lineHeight: 1,
              color: tier.text,
              textShadow: `0 0 12px ${tier.glow}`,
              fontVariantNumeric: 'tabular-nums',
            }}>{display}</span>
            <span style={{ fontSize: 9, color: '#4b5563', fontWeight: 600, marginTop: 2 }}>/100</span>
          </div>
        </div>

        {/* Right: description + mini bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {description && (
            <p style={{
              fontSize: 12, color: '#6b7280', lineHeight: 1.4,
              marginBottom: 10,
            }}>{description}</p>
          )}
          {/* Thin progress bar */}
          <div style={{
            height: 4, borderRadius: 99,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: visible ? `${display}%` : '0%',
              background: `linear-gradient(90deg, ${tier.stroke}99, ${tier.stroke})`,
              boxShadow: `0 0 6px ${tier.glow}`,
              transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 5,
          }}>
            <span style={{ fontSize: 10, color: '#374151' }}>0</span>
            <span style={{ fontSize: 10, color: '#374151' }}>100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
