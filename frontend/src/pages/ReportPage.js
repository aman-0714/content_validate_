import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScoreCard from '../components/ScoreCard';
import ScoreRadarChart from '../components/ScoreRadarChart';
import NextStepsPanel from '../components/NextStepsPanel';
import api from '../services/api';
import {
  ArrowLeft, Youtube, TrendingUp, Brain, Lightbulb, CheckCircle,
  ExternalLink, ThumbsUp, Eye, Calendar, Zap, BarChart2, Target,
  Copy, Check, Download, Share2, Link2, X
} from 'lucide-react';

// ─── Animated Score Ring ─────────────────────────────────────────────────────

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
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${c.glow})` }}
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

const VERDICT_TOKENS = {
  Excellent: {
    stroke: '#34d399', glow: 'rgba(52,211,153,0.5)', textColor: '#34d399',
    bgSpot: 'rgba(52,211,153,0.06)', border: 'rgba(52,211,153,0.22)',
    label: 'Excellent Idea', emoji: '🚀',
    msg: 'Outstanding potential. High demand, meaningful gap in the market. Build this now — you have first-mover advantage.',
    tag: 'Ship it',
  },
  Good: {
    stroke: '#818cf8', glow: 'rgba(129,140,248,0.5)', textColor: '#818cf8',
    bgSpot: 'rgba(129,140,248,0.06)', border: 'rgba(129,140,248,0.22)',
    label: 'Good Idea', emoji: '✅',
    msg: 'Solid idea with real audience pull. Needs a sharp, differentiated angle to cut through existing content.',
    tag: 'Worth building',
  },
  Average: {
    stroke: '#fbbf24', glow: 'rgba(251,191,36,0.5)', textColor: '#fbbf24',
    bgSpot: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.22)',
    label: 'Average Idea', emoji: '⚡',
    msg: 'Decent premise, but the niche is competitive or demand is unclear. A specific sub-angle could unlock this.',
    tag: 'Needs a pivot',
  },
  Poor: {
    stroke: '#f87171', glow: 'rgba(248,113,113,0.5)', textColor: '#f87171',
    bgSpot: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.22)',
    label: 'Weak Idea', emoji: '⚠️',
    msg: 'High competition or weak demand signals. Pivot the angle, target a narrower audience, or choose a different topic.',
    tag: 'Validate first',
  },
};

const VerdictBanner = ({ verdict, overallScore }) => {
  const t = VERDICT_TOKENS[verdict] || VERDICT_TOKENS.Average;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 20,
        padding: '28px 28px',
        marginBottom: 32,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #0d1017 0%, #080a0f 100%)',
        border: `1px solid ${t.border}`,
        boxShadow: `0 0 40px ${t.bgSpot}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      className="fade-in-up"
    >
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: `radial-gradient(circle, ${t.glow.replace('0.5','0.10')} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', padding: '4px 12px', borderRadius: 99,
            background: t.bgSpot, border: `1px solid ${t.border}`,
            color: t.textColor, marginBottom: 14,
          }}>{t.tag}</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>{t.emoji}</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: t.textColor, letterSpacing: '-0.02em' }}>
              {t.label}
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, maxWidth: 480 }}>{t.msg}</p>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <AnimatedScoreRing score={overallScore} verdict={verdict} />
          <p style={{ fontSize: 10, color: '#4b5563', marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Overall Score</p>
        </div>
      </div>
    </div>
  );
};

// ─── Score Breakdown Section ─────────────────────────────────────────────────

const BreakdownSection = ({ title, items, color }) => (
  <div className={`card border-l-4 ${color} fade-in-up`}>
    <h4 className="text-white font-semibold mb-3">{title}</h4>
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

// ─── Angle Card ───────────────────────────────────────────────────────────────

const AngleCard = ({ angle, index }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(angle);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className={`card hover:border-violet-500/50 hover:scale-[1.01] transition-all duration-200 group cursor-pointer fade-in-up delay-${Math.min(index + 1, 5)}`} onClick={handleCopy}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm group-hover:bg-violet-500/30 transition-colors">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">{angle}</p>
          <div className="flex items-center gap-1 mt-2 text-gray-600 text-xs group-hover:text-violet-500 transition-colors">
            {copied ? <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy size={11} /> Click to copy</>}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatNumber = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

// ─── Export Toolbar ───────────────────────────────────────────────────────────

const ExportToolbar = ({ reportId, reportTitle, shareToken: initialShareToken }) => {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing]         = useState(false);
  const [shareToken, setShareToken]   = useState(initialShareToken || null);
  const [copiedLink, setCopiedLink]   = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [revoking, setRevoking]       = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE}/api/export/${reportId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server responded ${response.status}: ${text}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle.replace(/[^a-z0-9]/gi, '_').slice(0, 60)}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
      alert(`Failed to download PDF: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleGenerateShare = async () => {
    setSharing(true);
    try {
      const res = await api.post(`/export/${reportId}/share`);
      const token = res.data?.shareToken || res.data?.data?.shareToken;
      if (!token) throw new Error('No share token returned');
      setShareToken(token);
      setShowSharePanel(true);
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to generate share link.');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRevoke = async () => {
    if (!window.confirm('Revoke this share link? Anyone with the link will lose access.')) return;
    setRevoking(true);
    try {
      await api.delete(`/export/${reportId}/share`);
      setShareToken(null);
      setShowSharePanel(false);
    } catch (err) {
      alert('Failed to revoke link.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="relative">
      {/* Toolbar buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* PDF Download */}
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-60"
          title="Download PDF report"
        >
          {downloading
            ? <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Generating…</>
            : <><Download size={15} /> PDF</>}
        </button>

        {/* Share link */}
        {shareToken ? (
          <button
            onClick={() => setShowSharePanel(p => !p)}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 border-emerald-500/40 text-emerald-400 hover:border-emerald-400"
            title="Share link active"
          >
            <Link2 size={15} /> Shared
          </button>
        ) : (
          <button
            onClick={handleGenerateShare}
            disabled={sharing}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-60"
            title="Generate shareable link"
          >
            {sharing
              ? <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Sharing…</>
              : <><Share2 size={15} /> Share</>}
          </button>
        )}
      </div>

      {/* Share panel dropdown */}
      {showSharePanel && shareToken && (
        <div className="absolute top-12 right-0 z-50 w-80 card border-gray-700 shadow-2xl shadow-black/60 fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold text-sm flex items-center gap-2"><Share2 size={14} className="text-violet-400" /> Share Report</span>
            <button onClick={() => setShowSharePanel(false)} className="text-gray-500 hover:text-white"><X size={15} /></button>
          </div>
          <p className="text-gray-400 text-xs mb-3">Anyone with this link can view a read-only version of this report — no login required.</p>
          <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2 border border-gray-700 mb-3">
            <span className="text-gray-400 text-xs truncate flex-1">{window.location.origin}/shared/{shareToken}</span>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 text-xs bg-violet-600 hover:bg-violet-500 text-white px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
            >
              {copiedLink ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
            </button>
          </div>
          <button
            onClick={handleRevoke}
            disabled={revoking}
            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 disabled:opacity-40"
          >
            <X size={11} /> {revoking ? 'Revoking…' : 'Revoke link'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ReportPage = () => {
  const { id } = useParams();
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-6 w-40 skeleton mb-6" />
        <div className="h-10 w-2/3 skeleton mb-2" />
        <div className="h-4 w-40 skeleton mb-8" />
        <div className="h-32 skeleton rounded-2xl mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm animate-pulse">Preparing your analysis…</p>
        </div>
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

  const TABS = [
    { key: 'overview',      label: 'Overview',       icon: '📊' },
    { key: 'next-steps',    label: 'Next Steps',      icon: '🎯' },
    { key: 'youtube',       label: 'YouTube',         icon: '▶️' },
    { key: 'google trends', label: 'Trends',          icon: '📈' },
    { key: 'ai-report',     label: 'AI Report',       icon: '🧠' },
    { key: 'breakdown',     label: 'Score Breakdown', icon: '🔍' },
    { key: 'angles',        label: 'Winning Angles',  icon: '💡' },
  ];

  const breakdown = report.breakdown || {};
  const weightRows = breakdown.weightExplanation || [
    `Demand ×0.35 → contributes ${Math.round(report.demandScore * 0.35)} pts`,
    `Originality ×0.30 → contributes ${Math.round(report.originalityScore * 0.30)} pts`,
    `Viral Potential ×0.25 → contributes ${Math.round(report.viralScore * 0.25)} pts`,
    `Low Competition ×0.10 → contributes ${Math.round((100 - report.competitionScore) * 0.10)} pts`,
  ];
  const maxPts = 100;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb + Export Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 fade-in-up flex-wrap">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-gray-500 hover:text-violet-400 flex items-center gap-1 text-sm transition-colors">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-gray-400 text-sm truncate max-w-xs">{report.title}</span>
          </div>
          <ExportToolbar
            reportId={report._id}
            reportTitle={report.title}
            shareToken={report.shareToken}
          />
        </div>

        {/* Title */}
        <div className="mb-6 fade-in-up delay-1">
          <h1 className="text-3xl font-bold text-white mb-2">"{report.title}"</h1>
          <p className="text-gray-500 text-sm">
            Analyzed on {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {report.confidenceScore > 0 && (
              <span className="ml-3 text-xs bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5">
                Confidence: <span className={report.confidenceScore >= 70 ? 'text-emerald-400' : report.confidenceScore >= 40 ? 'text-yellow-400' : 'text-red-400'}>{report.confidenceScore}/100</span>
              </span>
            )}
            {report.executionDifficulty > 0 && (
              <span className="ml-2 text-xs bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5">
                Execution difficulty: <span className={report.executionDifficulty >= 70 ? 'text-red-400' : report.executionDifficulty >= 40 ? 'text-yellow-400' : 'text-emerald-400'}>{report.executionDifficulty}/100</span>
              </span>
            )}
          </p>
        </div>

        <div className="fade-in-up delay-2">
          <VerdictBanner verdict={report.verdict} overallScore={report.overallScore} />
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Competition',    score: report.competitionScore, icon: '⚔️', desc: 'Higher = more saturated',   delay: 'delay-1' },
            { label: 'Demand',         score: report.demandScore,      icon: '🔥', desc: 'Audience interest level',   delay: 'delay-2' },
            { label: 'Originality',    score: report.originalityScore, icon: '💡', desc: 'Uniqueness of the angle',   delay: 'delay-3' },
            { label: 'Viral Potential',score: report.viralScore,       icon: '🚀', desc: 'Likelihood to spread',      delay: 'delay-4' },
          ].map(({ label, score, icon, desc, delay }) => (
            <div key={label} className={`fade-in-up ${delay}`}>
              <ScoreCard label={label} score={score} icon={icon} description={desc} />
            </div>
          ))}
        </div>

        {/* Keywords chips */}
        {report.keywords?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 fade-in-up">
            {report.keywords.slice(0, 12).map((kw, i) => (
              <span key={i} className="text-xs bg-violet-500/10 border border-violet-500/25 text-violet-300 px-2.5 py-1 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 fade-in-up delay-5">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="fade-in">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <ScoreRadarChart scores={report} />
                <div className="card fade-in-up">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-400" /> AI Recommendations
                  </h3>
                  {report.recommendations?.length > 0 ? (
                    <ul className="space-y-3">
                      {report.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                          <span className="w-6 h-6 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-gray-500 text-sm">No recommendations available.</p>}
                </div>
              </div>

              {/* Competitors mini panel */}
              {report.competitors?.length > 0 && (
                <div className="card fade-in-up">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">⚔️ Top Competitors</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {report.competitors.slice(0, 6).map((c, i) => (
                      <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                        <p className="text-white text-sm font-medium truncate">{c.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {c.views && <span className="text-gray-500 text-xs flex items-center gap-1"><Eye size={10} /> {formatNumber(c.views)}</span>}
                          {c.dominance && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                              c.dominance === 'dominant' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              c.dominance === 'moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-gray-700 text-gray-400 border-gray-600'}`}>
                              {c.dominance}
                            </span>
                          )}
                        </div>
                        {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 text-xs hover:text-violet-300 flex items-center gap-1 mt-1"><ExternalLink size={10} /> View</a>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market gaps */}
              {report.marketGaps?.length > 0 && (
                <div className="card fade-in-up border-l-4 border-emerald-500/40">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Target size={16} className="text-emerald-400" /> Market Gaps Detected</h3>
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
                <div className="card fade-in-up">
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
            </div>
          )}

          {/* NEXT STEPS */}
          {activeTab === 'next-steps' && (
            <div className="max-w-2xl">
              <NextStepsPanel recommendations={report.recommendations} verdict={report.verdict} betterAngles={report.betterAngles} />
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
                <div key={i} className={`card hover:border-gray-700 transition-all flex items-start gap-4 group fade-in-up delay-${Math.min(i + 1, 5)}`}>
                  {video.thumbnail && <img src={video.thumbnail} alt="" className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-violet-400 transition-colors line-clamp-2 flex items-start gap-1">
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
                <h3 className="text-white font-semibold">Demand Signals</h3>
              </div>
              {report.redditResults?.length > 0 ? report.redditResults.map((post, i) => (
                <div key={i} className={`card hover:border-gray-700 transition-all fade-in-up delay-${Math.min(i + 1, 5)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-violet-400 transition-colors flex items-start gap-1">
                        {post.title} <ExternalLink size={12} className="flex-shrink-0 mt-1" />
                      </a>
                      <p className="text-green-400 text-xs mt-1">{post.source || post.subreddit}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-3">
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><TrendingUp size={12} /> {formatNumber(Math.round(post.upvotes))}</span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Relevance</span><span>{Math.round((post.upvoteRatio || 0) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-green-400 rounded-full bar-fill" style={{ width: `${(post.upvoteRatio || 0) * 100}%` }} />
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
                    { key: 'competitionAnalysis',      title: '⚔️ Competition Analysis',   color: 'border-orange-500/40',  delay: 'delay-1' },
                    { key: 'audienceInterestAnalysis', title: '👥 Audience Interest',        color: 'border-blue-500/40',    delay: 'delay-2' },
                    { key: 'originalityAssessment',    title: '💡 Originality & Gap',        color: 'border-yellow-500/40',  delay: 'delay-3' },
                    { key: 'viralPotential',           title: '🚀 Viral Potential',          color: 'border-emerald-500/40', delay: 'delay-4' },
                    { key: 'suggestedImprovements',    title: '📈 Suggested Improvements',  color: 'border-violet-500/40',  delay: 'delay-5' },
                  ].map(section => report.aiReport[section.key] && (
                    <div key={section.key} className={`card border-l-4 ${section.color} hover:border-l-[5px] transition-all duration-200 fade-in-up ${section.delay}`}>
                      <h4 className="text-white font-semibold mb-3">{section.title}</h4>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">{report.aiReport[section.key]}</p>
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
              <div className="card fade-in-up">
                <h4 className="text-white font-semibold mb-5 flex items-center gap-2">⚖️ Score Weight Breakdown</h4>
                {weightRows.map((item, i) => {
                  const pts = parseInt(item.match(/(\d+) pts/)?.[1] || 0);
                  const barColors = ['bg-blue-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-violet-500'];
                  const pct = Math.min((pts / maxPts) * 100, 100);
                  return (
                    <div key={i} className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-300">{item.split('→')[0]?.trim()}</span>
                        <span className="text-white font-bold">{pts} pts</span>
                      </div>
                      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-2.5 rounded-full ${barColors[i]} bar-fill`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="mt-5 pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Overall Score</span>
                  <span className="text-violet-400 font-bold text-xl">{report.overallScore} / 100</span>
                </div>
              </div>
              <BreakdownSection title="⚔️ Competition Factors" items={breakdown.competitionFactors || [`${report.youtubeResults?.length || 0} competing videos found`]} color="border-orange-500/40" />
              <BreakdownSection title="🔥 Demand Factors"      items={breakdown.demandFactors      || [`${report.redditResults?.length || 0} demand signals collected`]} color="border-blue-500/40" />
              <div className="card border-l-4 border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 to-transparent fade-in-up">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2"><Target size={16} className="text-emerald-400" /> 🎯 Market Gaps Detected</h4>
                <p className="text-gray-500 text-xs mb-3">Real opportunities identified from the data:</p>
                <ul className="space-y-3">
                  {(breakdown.marketGaps || report.scoreBreakdown?.marketGaps || ['No gap data — rerun the analysis']).map((gap, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* WINNING ANGLES */}
          {activeTab === 'angles' && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <Lightbulb size={20} className="text-yellow-400" />
                  <h3 className="text-white font-semibold">Winning Angles</h3>
                  {report.betterAngles?.length > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold px-2 py-0.5 rounded-full">{report.betterAngles.length} ideas</span>
                  )}
                </div>
                {report.betterAngles?.length > 0 && (
                  <button onClick={() => navigator.clipboard.writeText(report.betterAngles.join('\n'))} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                    <Copy size={12} /> Copy All
                  </button>
                )}
              </div>
              {report.betterAngles?.length > 0 ? (
                <>
                  <div className="card mb-4 bg-gradient-to-r from-violet-900/40 to-indigo-900/30 border-violet-500/30 fade-in-up">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="text-violet-300 text-xs font-semibold uppercase tracking-wider mb-1">Top Recommended Angle</p>
                        <p className="text-white font-semibold">{report.betterAngles[0]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {report.betterAngles.map((angle, i) => <AngleCard key={i} angle={angle} index={i} />)}
                  </div>
                </>
              ) : (
                <div className="card text-center py-12">
                  <Lightbulb size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No angle suggestions generated.</p>
                </div>
              )}
              <div className="card mt-6 text-center bg-gradient-to-r from-violet-900/30 to-indigo-900/30 border-violet-500/20">
                <p className="text-gray-300 mb-4">Want to validate one of these improved angles?</p>
                <Link to="/analyzer" className="btn-primary inline-flex items-center gap-2"><Zap size={16} /> Analyze a New Idea</Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportPage;
