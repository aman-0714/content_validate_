import React, { useEffect, useRef, useState } from 'react';

// Animated circular progress ring + glassmorphism card
const ScoreCard = ({ label, score, icon, description }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  const getColor = (s) => {
    if (s >= 75) return {
      text: 'text-emerald-400',
      stroke: '#34d399',
      glow: 'rgba(52,211,153,0.4)',
      bg: 'from-emerald-500/10 to-emerald-900/5',
      ring: 'ring-emerald-500/20',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      label: 'Excellent'
    };
    if (s >= 55) return {
      text: 'text-blue-400',
      stroke: '#60a5fa',
      glow: 'rgba(96,165,250,0.4)',
      bg: 'from-blue-500/10 to-blue-900/5',
      ring: 'ring-blue-500/20',
      badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      label: 'Good'
    };
    if (s >= 35) return {
      text: 'text-yellow-400',
      stroke: '#fbbf24',
      glow: 'rgba(251,191,36,0.4)',
      bg: 'from-yellow-500/10 to-yellow-900/5',
      ring: 'ring-yellow-500/20',
      badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
      label: 'Average'
    };
    return {
      text: 'text-red-400',
      stroke: '#f87171',
      glow: 'rgba(248,113,113,0.4)',
      bg: 'from-red-500/10 to-red-900/5',
      ring: 'ring-red-500/20',
      badge: 'bg-red-500/15 text-red-300 border-red-500/30',
      label: 'Low'
    };
  };

  const colors = getColor(score);

  // Intersection Observer — animate when card enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = score / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [isVisible, score]);

  // SVG ring math
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = isVisible ? ((100 - displayScore) / 100) * circumference : circumference;

  return (
    <div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br ${colors.bg}
        border border-gray-800 ring-1 ${colors.ring}
        hover:border-gray-700 hover:scale-[1.02] hover:shadow-lg
        transition-all duration-300 ease-out
        backdrop-blur-sm
        group
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(9,9,11,0.95) 100%)',
        boxShadow: isVisible ? `0 0 0 1px rgba(75,85,99,0.3), inset 0 1px 0 rgba(255,255,255,0.05)` : 'none'
      }}
    >
      {/* Subtle animated gradient shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${colors.glow.replace('0.4', '0.06')} 0%, transparent 70%)`
        }}
      />

      <div className="flex items-center justify-between gap-3">
        {/* Left: label + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide truncate">{label}</p>
          </div>
          {description && (
            <p className="text-gray-600 text-xs leading-tight">{description}</p>
          )}
          {/* Rating badge */}
          <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badge} uppercase tracking-wider`}>
            {colors.label}
          </span>
        </div>

        {/* Right: animated circular ring */}
        <div className="flex-shrink-0 relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={strokeWidth}
            />
            {/* Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: `drop-shadow(0 0 4px ${colors.glow})`
              }}
            />
          </svg>
          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold leading-none ${colors.text}`}>{displayScore}</span>
            <span className="text-gray-600 text-[9px] font-medium leading-none mt-0.5">/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
