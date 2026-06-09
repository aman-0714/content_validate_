import React from 'react';

const LoadingSpinner = ({ message = 'Analyzing your idea...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-700 rounded-full" />
      <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full absolute top-0 left-0 animate-spin" />
    </div>
    <div className="text-center">
      <p className="text-white font-semibold text-lg">{message}</p>
      <p className="text-gray-500 text-sm mt-1">Searching YouTube, Google Trends & generating AI report...</p>
    </div>
    <div className="flex gap-2">
      {['YouTube', 'Google Trends', 'AI Analysis'].map((step, i) => (
        <span key={i} className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
          {step}
        </span>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;
