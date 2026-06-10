import React, { useState } from 'react';
import { Zap, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const NextStepsPanel = ({ recommendations = [], verdict = 'Average', betterAngles = [] }) => {
  const [checked, setChecked] = useState({});

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  const fallbackSteps = {
    Excellent: [
      'Register a domain / channel name for this idea today',
      'Create a 60-second concept video and post it as a Short',
      'Find the top competitor and map every angle they haven\'t covered',
      'Post in 2–3 niche Reddit communities to validate demand before building',
    ],
    Good: [
      'Narrow the audience: pick one specific segment and speak only to them',
      'Test the idea as a short-form video before committing to long-form',
      'Study the top 3 competing videos — reverse-engineer their hooks',
      'Pick one monetization angle and build the content strategy around it',
    ],
    Average: [
      'Reframe the idea around a specific underserved audience (not everyone)',
      'Find a gap in the existing videos — missing language, format, or depth',
      'Run a quick poll on Twitter / Reddit before investing time',
      'Consider pivoting to one of the "Better Angles" suggestions in this report',
    ],
    Poor: [
      'Do not build yet — validate demand first with a single post or tweet',
      'Explore the "Better Angles" tab for a higher-potential reframe',
      'Search for the top video in this niche and find what it\'s missing',
      'Target a niche sub-audience instead of the broad topic',
    ],
  };

  const steps = recommendations.length >= 3
    ? recommendations
    : fallbackSteps[verdict] || fallbackSteps.Average;

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const timeLabels = ['Start today', 'This week', 'Next 2 weeks', 'This month', 'Ongoing'];

  const verdictGrad = {
    Excellent: 'linear-gradient(135deg, #059669, #0d9488)',
    Good:      'linear-gradient(135deg, #4f46e5, #7c3aed)',
    Average:   'linear-gradient(135deg, #d97706, #ea580c)',
    Poor:      'linear-gradient(135deg, #dc2626, #e11d48)',
  };
  const grad = verdictGrad[verdict] || verdictGrad.Average;

  return (
    <div style={{
      background: '#111318',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      overflow: 'hidden',
    }} className="border-pulse fade-in-up">

      {/* ── Header ── */}
      <div style={{
        background: grad,
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Zap size={18} color="white" />
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: 17, lineHeight: 1.2, margin: 0 }}>
                What Should I Do Next?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0, marginTop: 2 }}>
                Your personalised action roadmap
              </p>
            </div>
          </div>

          {/* Progress counter */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
              {completedCount}/{steps.length}
            </span>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, marginTop: 2 }}>
              done
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 16, height: 6, borderRadius: 99,
          background: 'rgba(255,255,255,0.2)',
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'rgba(255,255,255,0.9)',
            width: `${progress}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>

        {progress === 100 && (
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> All done — time to ship it!
          </p>
        )}
      </div>

      {/* ── Steps ── */}
      <ul style={{ padding: '16px 20px', margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step, i) => (
          <li
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px', borderRadius: 12,
              border: `1px solid ${checked[i] ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
              background: checked[i] ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
              opacity: checked[i] ? 0.55 : 1,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            {/* Circle checkbox */}
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              border: `2px solid ${checked[i] ? '#10b981' : 'rgba(255,255,255,0.25)'}`,
              background: checked[i] ? '#10b981' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s ease',
            }}>
              {checked[i] && <CheckCircle2 size={11} color="white" />}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 14, lineHeight: 1.45, margin: 0,
                color: checked[i] ? '#6b7280' : '#e5e7eb',
                textDecoration: checked[i] ? 'line-through' : 'none',
              }}>
                <span style={{ color: '#a78bfa', fontWeight: 700, marginRight: 4 }}>#{i + 1}</span>
                {step}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Clock size={10} color="#4b5563" />
                <span style={{ fontSize: 10, color: '#4b5563' }}>{timeLabels[i] || 'Ongoing'}</span>
              </div>
            </div>

            <ArrowRight size={14} color="#374151" style={{ flexShrink: 0, marginTop: 2, opacity: checked[i] ? 0 : 1 }} />
          </li>
        ))}
      </ul>

      {/* ── Angles hint ── */}
      {betterAngles?.length > 0 && (
        <div style={{
          margin: '0 20px 16px', padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 14,
        }}>
          <p style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <Zap size={11} color="#fbbf24" />
            Tip: check the <span style={{ color: '#a78bfa', fontWeight: 600 }}>Winning Angles</span> tab — {betterAngles.length} stronger pivots were generated.
          </p>
        </div>
      )}
    </div>
  );
};

export default NextStepsPanel;
