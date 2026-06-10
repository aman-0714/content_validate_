import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ScoreCard from '../components/ScoreCard';
import ScoreRadarChart from '../components/ScoreRadarChart';
import { TrendingUp, Target, Eye, CheckCircle, Lightbulb, Brain, ExternalLink, Zap } from 'lucide-react';

const formatNumber = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

const verdictConfig = {
  Excellent: { text: 'text-emerald-400', border: 'border-emerald-500/30', emoji: '🚀' },
  Good:      { text: 'text-blue-400',    border: 'border-blue-500/30',    emoji: '✅' },
  Average:   { text: 'text-yellow-400',  border: 'border-yellow-500/20',  emoji: '⚡' },
  Poor:      { text: 'text-red-400',     border: 'border-red-500/20',     emoji: '⚠️' },
};

const SharedReportPage = () => {
  const { token } = useParams();
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        // public endpoint — no auth header needed
        const res = await window.fetch(`/api/export/shared/${token}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setReport(json.data);
      } catch (err) {
        setError(err.message || 'This report could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 animate-pulse">Loading shared report…</p>
      </div>
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-white text-xl font-bold mb-2">Report not found</h2>
        <p className="text-gray-400 text-sm mb-6">{error || 'This link may have been revoked or never existed.'}</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2"><Zap size={16} /> Try IdeaValidator</Link>
      </div>
    </div>
  );

  const vc = verdictConfig[report.verdict] || verdictConfig.Average;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Shared header bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <span className="text-violet-400 font-bold text-lg tracking-tight">IdeaValidator</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs">Shared report · read-only</span>
          <Link to="/signup" className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"><Zap size={13} /> Try Free</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Title + verdict */}
        <div className={`border ${vc.border} rounded-2xl p-6 mb-8 bg-gray-900`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">"{report.title}"</h1>
              <p className="text-gray-500 text-sm">
                {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs mb-1">Overall Score</p>
              <p className={`text-4xl font-black ${vc.text}`}>{report.overallScore}</p>
              <p className={`text-sm font-semibold ${vc.text}`}>{vc.emoji} {report.verdict}</p>
            </div>
          </div>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ScoreCard label="Competition"     score={report.competitionScore} icon="⚔️" description="Higher = more saturated" />
          <ScoreCard label="Demand"          score={report.demandScore}      icon="🔥" description="Audience interest level" />
          <ScoreCard label="Originality"     score={report.originalityScore} icon="💡" description="Uniqueness of the angle" />
          <ScoreCard label="Viral Potential" score={report.viralScore}       icon="🚀" description="Likelihood to spread" />
        </div>

        {/* Keywords */}
        {report.keywords?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {report.keywords.slice(0, 12).map((kw, i) => (
              <span key={i} className="text-xs bg-violet-500/10 border border-violet-500/25 text-violet-300 px-2.5 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <ScoreRadarChart scores={report} />

          {/* Recommendations */}
          <div className="card">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-emerald-400" /> Recommendations</h3>
            {report.recommendations?.length > 0
              ? <ul className="space-y-3">{report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="w-6 h-6 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                    {rec}
                  </li>
                ))}</ul>
              : <p className="text-gray-500 text-sm">No recommendations.</p>}
          </div>
        </div>

        {/* Competitors */}
        {report.competitors?.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-white font-semibold mb-4">⚔️ Top Competitors</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {report.competitors.slice(0, 6).map((c, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                  <p className="text-white text-sm font-medium truncate">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {c.views && <span className="text-gray-500 text-xs flex items-center gap-1"><Eye size={10} /> {formatNumber(c.views)}</span>}
                    {c.dominance && <span className={`text-xs px-1.5 py-0.5 rounded-full border ${c.dominance === 'dominant' ? 'bg-red-500/10 text-red-400 border-red-500/20' : c.dominance === 'moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>{c.dominance}</span>}
                  </div>
                  {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 text-xs flex items-center gap-1 mt-1"><ExternalLink size={10} /> View</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Gaps */}
        {report.marketGaps?.length > 0 && (
          <div className="card mb-6 border-l-4 border-emerald-500/40">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Target size={16} className="text-emerald-400" /> Market Gaps</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {report.marketGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-2 bg-emerald-950/30 border border-emerald-500/15 rounded-lg p-3">
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-shrink-0">{gap.type || 'gap'}</span>
                  <p className="text-gray-300 text-sm">{gap.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trend snapshot */}
        {report.trendData && (
          <div className="card mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-green-400" /> Trend Snapshot</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
              {[
                { label: 'Reddit signals', val: report.trendData.redditSignals },
                { label: 'Total upvotes',  val: formatNumber(report.trendData.totalUpvotes) },
                { label: 'YT videos',      val: report.trendData.youtubeVideos },
                { label: 'Avg views',      val: formatNumber(report.trendData.avgViews) },
                { label: 'Recent uploads', val: report.trendData.recentUploads },
                { label: 'Like ratio',     val: (report.trendData.avgLikeViewRatio || 0).toFixed(3) },
              ].map(({ label, val }) => (
                <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                  <p className="text-white font-bold text-lg">{val}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Report */}
        {report.aiReport && Object.values(report.aiReport).some(Boolean) && (
          <div className="space-y-4 mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2"><Brain size={18} className="text-violet-400" /> AI Deep-Dive</h3>
            {[
              { key: 'competitionAnalysis',      title: '⚔️ Competition Analysis',  color: 'border-orange-500/40' },
              { key: 'audienceInterestAnalysis', title: '👥 Audience Interest',       color: 'border-blue-500/40' },
              { key: 'originalityAssessment',    title: '💡 Originality & Gap',       color: 'border-yellow-500/40' },
              { key: 'viralPotential',           title: '🚀 Viral Potential',         color: 'border-emerald-500/40' },
              { key: 'suggestedImprovements',    title: '📈 Suggested Improvements', color: 'border-violet-500/40' },
            ].map(s => report.aiReport[s.key] && (
              <div key={s.key} className={`card border-l-4 ${s.color}`}>
                <h4 className="text-white font-semibold mb-2">{s.title}</h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{report.aiReport[s.key]}</p>
              </div>
            ))}
          </div>
        )}

        {/* Winning angles */}
        {report.betterAngles?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Lightbulb size={18} className="text-yellow-400" /> Winning Angles</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {report.betterAngles.map((angle, i) => (
                <div key={i} className="card text-sm text-white">
                  <span className="text-violet-400 font-bold mr-2">{i + 1}.</span> {angle}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="card text-center bg-gradient-to-r from-violet-900/40 to-indigo-900/30 border-violet-500/20">
          <p className="text-white font-bold text-lg mb-2">Validate your own content ideas</p>
          <p className="text-gray-400 text-sm mb-4">Get YouTube, Reddit & AI-powered analysis in seconds.</p>
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2"><Zap size={16} /> Start Free</Link>
        </div>
      </div>
    </div>
  );
};

export default SharedReportPage;
