import React, { useState } from 'react';
import { Zap, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * NextStepsPanel
 * Renders a prioritised "What Should I Do Next?" action checklist.
 * Props:
 *   recommendations  – string[]  from AI report
 *   verdict          – string    "Excellent" | "Good" | "Average" | "Poor"
 *   betterAngles     – string[]  from AI report
 */
const NextStepsPanel = ({ recommendations = [], verdict = 'Average', betterAngles = [] }) => {
  const [checked, setChecked] = useState({});

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  // Build steps: first from recommendations, fallback to static hints by verdict
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

  const verdictColor = {
    Excellent: 'from-emerald-600 to-teal-600',
    Good:      'from-blue-600 to-indigo-600',
    Average:   'from-yellow-600 to-orange-600',
    Poor:      'from-red-600 to-rose-600',
  };
  const headerGrad = verdictColor[verdict] || verdictColor.Average;

  return (
    <div className="card border-pulse overflow-hidden fade-in-up">
      {/* Header */}
      <div className={`-mx-6 -mt-6 px-6 py-5 mb-6 bg-gradient-to-r ${headerGrad} animated-gradient`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">What Should I Do Next?</h3>
              <p className="text-white/70 text-xs">Your personalised action roadmap</p>
            </div>
          </div>
          {/* Progress pill */}
          <div className="text-right">
            <span className="text-white font-bold text-xl">{completedCount}/{steps.length}</span>
            <p className="text-white/60 text-[10px] uppercase tracking-wide">done</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-2 bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-white/80 text-xs mt-2 flex items-center gap-1">
            <CheckCircle2 size={12} /> All done — time to ship it!
          </p>
        )}
      </div>

      {/* Steps */}
      <ul className="space-y-3">
        {steps.map((step, i) => (
          <li
            key={i}
            className={`
              flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer group
              ${checked[i]
                ? 'bg-gray-800/40 border-gray-700/30 opacity-60'
                : 'bg-gray-800/20 border-gray-700/50 hover:border-violet-500/40 hover:bg-gray-800/50'}
            `}
            onClick={() => toggle(i)}
          >
            {/* Checkbox */}
            <div className={`
              w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all
              ${checked[i]
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-gray-600 group-hover:border-violet-400'}
            `}>
              {checked[i] && <CheckCircle2 size={12} className="text-white" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${checked[i] ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                <span className="text-violet-400 font-bold mr-1">#{i + 1}</span>
                {step}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={10} className="text-gray-600" />
                <span className="text-gray-600 text-[10px]">{timeLabels[i] || 'Ongoing'}</span>
              </div>
            </div>

            <ArrowRight size={14} className={`text-gray-600 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 ${checked[i] ? 'opacity-0' : ''}`} />
          </li>
        ))}
      </ul>

      {/* Hint if angles exist */}
      {betterAngles?.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-800">
          <p className="text-gray-500 text-xs flex items-center gap-1.5">
            <Zap size={11} className="text-yellow-400" />
            Tip: check the <span className="text-violet-400 font-medium">Better Angles</span> tab — {betterAngles.length} stronger pivots were generated for this idea.
          </p>
        </div>
      )}
    </div>
  );
};

export default NextStepsPanel;
