import React from 'react';

const ScoreCard = ({ label, score, icon, description }) => {
  const getColor = (s) => {
    if (s >= 75) return { text: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500/30' };
    if (s >= 55) return { text: 'text-blue-400', bg: 'bg-blue-500', ring: 'ring-blue-500/30' };
    if (s >= 35) return { text: 'text-yellow-400', bg: 'bg-yellow-500', ring: 'ring-yellow-500/30' };
    return { text: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500/30' };
  };

  const colors = getColor(score);

  return (
    <div className={`card hover:border-gray-700 transition-all duration-300 ring-1 ${colors.ring}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className={`text-4xl font-bold mt-1 ${colors.text}`}>{score}<span className="text-lg text-gray-500">/100</span></p>
        </div>
        <div className={`text-2xl`}>{icon}</div>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full ${colors.bg} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      {description && <p className="text-gray-500 text-xs">{description}</p>}
    </div>
  );
};

export default ScoreCard;
