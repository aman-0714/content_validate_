import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScoreCard from '../components/ScoreCard';
import ScoreRadarChart from '../components/ScoreRadarChart';
import api from '../services/api';
import {
  ArrowLeft, Youtube, TrendingUp, Brain, Lightbulb, CheckCircle,
  ExternalLink, ThumbsUp, Eye, Calendar, Zap, BarChart2, Target
} from 'lucide-react';

// ─── Animated Score Ring (Overall Score in banner) ─────────────────────────

const AnimatedScoreRing = ({ score, verdict }) => {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  const colorMap = {
    Excellent: { stroke: '#34d399', text: 'text-emerald-400', glow: 'rgba(52,211,153,0.5)' },
    Good:      { stroke: '#60a5fa', text: 'text-blue-400',    glow: 'rgba(96,165,250,0.5)' },
    Average:   { stroke: '#fbbf24', text: 'text-yellow-400',  glow: 'rgba(251,191,36,0.5)' },
    Poor:      { stroke: '#f87171', text: 'text-red-400',     glow: 'rgba(248,113,113,0.5)' },
  };
  const c = colorMap[verdict] || colorMap.Average;

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!started) return;
    let val = 0;
    const step = 16;
    const inc = score / (1400 / step);
    const t = setInterval(() => {
      val += inc;
      if (val >= score) { setDisplay(score); clearInterval(t); }
      else setDisplay(Math.round(val));
    }, step);
    return () => clearInterval(t);
  }, [started, score]);

  const size = 110;
  const sw = 8;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = started ? ((100 - display) / 100) * circ : circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={c.stroke} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 8px ${c.glow})`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black leading-none ${c.text}`}>{display}</span>
        <span className="text-gray-500 text-[10px] font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
};

// ─── Verdict Banner ──────────────────────────────────────────────────────────

const VerdictBanner = ({ verdict, overallScore }) => {
  const configs = {
    Excellent: {
      bg: 'from-emerald-950/80 via-emerald-900/30 to-gray-950',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      emoji: '🚀',
      msg: 'Outstanding potential. High demand, meaningful gap in the market. Build this now — you have first-mover advantage.'
    },
    Good: {
      bg: 'from-blue-950/80 via-blue-900/30 to-gray-950',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      emoji: '✅',
      msg: 'Solid idea with real audience pull. Needs a sharp, differentiated angle to cut through existing content.'
    },
    Average: {
      bg: 'from-yellow-950/70 via-yellow-900/20 to-gray-950',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      emoji: '⚡',
      msg: 'Decent premise, but the niche is competitive or demand is unclear. A specific sub-angle could unlock this.'
    },
    Poor: {
      bg: 'from-red-950/70 via-red-900/20 to-gray-950',
      border: 'border-red-500/20',
      text: 'text-red-400',
      emoji: '⚠️',
      msg: 'High competition or weak demand signals. Pivot the angle, target a narrower audience, or choose a different topic.'
    },
  };
  const c = configs[verdict] || configs.Average;

  return (
    <div className={`bg-gradient-to-r ${c.bg} border ${c.border} rounded-2xl p-6 mb-8 relative overflow-hidden`}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 80% 50%, ${c.border.includes('emerald') ? 'rgba(52,211,153,0.04)' : c.border.includes('blue') ? 'rgba(96,165,250,0.04)' : c.border.includes('yellow') ? 'rgba(251,191,36,0.04)' : 'rgba(248,113,113,0.04)'} 0%, transparent 70%)` }}
      />
      <div className="flex items-center justify-between flex-wrap gap-6 relative">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{c.emoji}</span>
            <span className={`text-2xl font-bold ${c.text}`}>{verdict} Idea</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-xl">{c.msg}</p>
        </div>
        <AnimatedScoreRing score={overallScore} verdict={verdict} />
      </div>
    </div>
  );
};

// ─── Score Breakdown Card ─────────────────────────────────────────────────────

const BreakdownSection = ({ title, icon, items, color }) => (
  <div className={`card border-l-4 ${color}`}>
    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
      {icon} {title}
    </h4>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
          <span className="text-gray-500 mt-0.5 flex-shrink-0">•</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const formatNumber = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ReportPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get(`/analysis/${id}`);
        setReport(data.data);
      } catch (err) {
        setError('Failed to load report. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm animate-pulse">Loading your analysis report…</p>
      </div>
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-red-400 text-lg">{error || 'Report not found'}</p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );

  const TABS = ['overview', 'youtube', 'google trends', 'ai-report', 'breakdown', 'angles'];
  const TAB_LABELS = {
    'overview': 'Overview',
    'youtube': 'YouTube',
    'google trends': 'Trends',
    'ai-report': 'AI Report',
    'breakdown': 'Score Breakdown',
    'angles': 'Better Angles'
  };

  const breakdown = report.breakdown || {};

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/dashboard" className="text-gray-500 hover:text-violet-400 flex items-center gap-1 text-sm transition-colors">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 text-sm truncate max-w-xs">{report.title}</span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">"{report.title}"</h1>
          <p className="text-gray-500 text-sm">
            Analyzed on {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <VerdictBanner verdict={report.verdict} overallScore={report.overallScore} />

        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ScoreCard label="Competition" score={report.competitionScore} icon="⚔️" description="Higher = more saturated" />
          <ScoreCard label="Demand" score={report.demandScore} icon="🔥" description="Audience interest level" />
          <ScoreCard label="Originality" score={report.originalityScore} icon="💡" description="Uniqueness of the angle" />
          <ScoreCard label="Viral Potential" score={report.viralScore} icon="🚀" description="Likelihood to spread" />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="fade-in">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <ScoreRadarChart scores={report} />
              <div className="card">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-400" /> Recommendations
                </h3>
                {report.recommendations?.length > 0 ? (
                  <ul className="space-y-3">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                        <span className="w-6 h-6 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-gray-500 text-sm">No recommendations available.</p>}
              </div>
            </div>
          )}

          {/* YOUTUBE */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Youtube size={20} className="text-red-400" />
                <h3 className="text-white font-semibold">Top {report.youtubeResults?.length || 0} YouTube Videos Found</h3>
              </div>
              {report.youtubeResults?.length > 0 ? report.youtubeResults.map((video, i) => (
                <div key={i} className="card hover:border-gray-700 transition-all flex items-start gap-4 group">
                  {video.thumbnail && (
                    <img src={video.thumbnail} alt="" className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <a href={video.url} target="_blank" rel="noopener noreferrer"
                      className="text-white font-medium hover:text-violet-400 transition-colors line-clamp-2 flex items-start gap-1">
                      {video.title} <ExternalLink size={12} className="flex-shrink-0 mt-1" />
                    </a>
                    <p className="text-gray-500 text-sm mt-1">{video.channelName}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="flex items-center gap-1 text-gray-400 text-xs"><Eye size={12} /> {formatNumber(video.viewCount)} views</span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs"><ThumbsUp size={12} /> {formatNumber(video.likeCount)} likes</span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs"><Calendar size={12} /> {new Date(video.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )) : <div className="card text-center py-12 text-gray-500">No YouTube data available</div>}
            </div>
          )}

          {/* TRENDS */}
          {activeTab === 'google trends' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-green-400" />
                <h3 className="text-white font-semibold">Demand Signals — Google Trends & Wikipedia</h3>
              </div>
              {report.redditResults?.length > 0 ? report.redditResults.map((post, i) => (
                <div key={i} className="card hover:border-gray-700 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a href={post.url} target="_blank" rel="noopener noreferrer"
                        className="text-white font-medium hover:text-violet-400 transition-colors flex items-start gap-1">
                        {post.title} <ExternalLink size={12} className="flex-shrink-0 mt-1" />
                      </a>
                      <p className="text-green-400 text-xs mt-1">{post.source || post.subreddit}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-3">
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                      <TrendingUp size={12} /> Interest score: {formatNumber(Math.round(post.upvotes))}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Relevance</span>
                      <span>{Math.round((post.upvoteRatio || 0) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full">
                      <div className="h-1.5 bg-green-400 rounded-full transition-all duration-700"
                        style={{ width: `${(post.upvoteRatio || 0) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="card text-center py-12">
                  <TrendingUp size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No trend data available for this topic.</p>
                </div>
              )}
            </div>
          )}

          {/* AI REPORT */}
          {activeTab === 'ai-report' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={20} className="text-violet-400" />
                <h3 className="text-white font-semibold">AI Deep-Dive Report</h3>
              </div>
              {report.aiReport && Object.keys(report.aiReport).some(k => report.aiReport[k]) ? (
                <>
                  {[
                    { key: 'competitionAnalysis',      title: '⚔️ Competition Analysis',     color: 'border-orange-500/40' },
                    { key: 'audienceInterestAnalysis', title: '👥 Audience Interest',         color: 'border-blue-500/40' },
                    { key: 'originalityAssessment',    title: '💡 Originality & Gap',         color: 'border-yellow-500/40' },
                    { key: 'viralPotential',           title: '🚀 Viral Potential',           color: 'border-emerald-500/40' },
                    { key: 'suggestedImprovements',    title: '📈 Suggested Improvements',   color: 'border-violet-500/40' },
                  ].map(section => report.aiReport[section.key] && (
                    <div key={section.key} className={`card border-l-4 ${section.color} hover:border-l-[5px] transition-all duration-200`}>
                      <h4 className="text-white font-semibold mb-3">{section.title}</h4>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">{report.aiReport[section.key]}</p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="card text-center py-12">
                  <Brain size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">AI report unavailable. Check that GROQ_API_KEY is configured.</p>
                </div>
              )}
            </div>
          )}

          {/* SCORE BREAKDOWN */}
          {activeTab === 'breakdown' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={20} className="text-blue-400" />
                <h3 className="text-white font-semibold">Why These Scores? Full Breakdown</h3>
              </div>

              {/* Weight contribution bar */}
              <div className="card">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>⚖️</span> Score Weight Breakdown
                </h4>
                {(breakdown.weightExplanation || [
                  `Demand ×0.35 → contributes ${Math.round(report.demandScore * 0.35)} pts`,
                  `Originality ×0.30 → contributes ${Math.round(report.originalityScore * 0.30)} pts`,
                  `Viral Potential ×0.25 → contributes ${Math.round(report.viralScore * 0.25)} pts`,
                  `Low Competition ×0.10 → contributes ${Math.round((100 - report.competitionScore) * 0.10)} pts`
                ]).map((item, i) => {
                  const pts = parseInt(item.match(/(\d+) pts/)?.[1] || 0);
                  const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-violet-500'];
                  return (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{item.split('→')[0]?.trim()}</span>
                        <span className="text-white font-bold">{pts} pts</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${colors[i]} transition-all duration-700`}
                          style={{ width: `${(pts / report.overallScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between">
                  <span className="text-gray-400 font-medium">Overall Score</span>
                  <span className="text-violet-400 font-bold text-lg">{report.overallScore} / 100</span>
                </div>
              </div>

              <BreakdownSection
                title="⚔️ Competition Factors"
                icon=""
                items={breakdown.competitionFactors || [`${report.youtubeResults?.length || 0} competing videos found`]}
                color="border-orange-500/40"
              />

              <BreakdownSection
                title="🔥 Demand Factors"
                icon=""
                items={breakdown.demandFactors || [`${report.redditResults?.length || 0} demand signals collected`]}
                color="border-blue-500/40"
              />

              <div className="card border-l-4 border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 to-transparent">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Target size={16} className="text-emerald-400" /> 🎯 Market Gaps Detected
                </h4>
                <p className="text-gray-500 text-xs mb-3">These are real opportunities identified from the data:</p>
                <ul className="space-y-3">
                  {(breakdown.marketGaps || report.scoreBreakdown?.marketGaps || ['No gap data — rerun the analysis']).map((gap, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* BETTER ANGLES */}
          {activeTab === 'angles' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb size={20} className="text-yellow-400" />
                <h3 className="text-white font-semibold">Better Angle Suggestions</h3>
              </div>
              {report.betterAngles?.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {report.betterAngles.map((angle, i) => (
                    <div
                      key={i}
                      className="card hover:border-violet-500/50 hover:scale-[1.01] transition-all duration-200 group cursor-pointer"
                      onClick={() => navigator.clipboard.writeText(angle)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm group-hover:bg-violet-500/30 transition-colors">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{angle}</p>
                          <p className="text-gray-600 text-xs mt-2 group-hover:text-violet-500 transition-colors">
                            Click to copy ↗
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <Lightbulb size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No angle suggestions generated.</p>
                </div>
              )}
              <div className="card mt-6 text-center bg-gradient-to-r from-violet-900/30 to-indigo-900/30 border-violet-500/20">
                <p className="text-gray-300 mb-4">Want to validate one of these improved angles?</p>
                <Link to="/analyzer" className="btn-primary inline-flex items-center gap-2">
                  <Zap size={16} /> Analyze a New Idea
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportPage;
