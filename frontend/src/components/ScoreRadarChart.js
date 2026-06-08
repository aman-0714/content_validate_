import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const ScoreRadarChart = ({ scores }) => {
  const data = [
    { subject: 'Demand', value: scores.demandScore },
    { subject: 'Originality', value: scores.originalityScore },
    { subject: 'Viral', value: scores.viralScore },
    { subject: 'Low Comp.', value: 100 - scores.competitionScore },
    { subject: 'Overall', value: scores.overallScore },
  ];

  return (
    <div className="card">
      <h3 className="text-white font-semibold mb-4">Score Overview</h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Radar name="Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
            formatter={(val) => [`${val}/100`]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreRadarChart;
