import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScoreCard from '../components/ScoreCard';
import ScoreRadarChart from '../components/ScoreRadarChart';
import api from '../services/api';
import {
  ArrowLeft, Youtube, TrendingUp, Brain, Lightbulb, CheckCircle,
  ExternalLink, ThumbsUp, Eye, Calendar, Zap
} from 'lucide-react';

const VerdictBanner = ({ verdict, overallScore }) => {
  const configs = {
    Excellent: { bg: 'from-emerald-900/60 to-emerald-800/30', border: 'border-emerald-500/40', text: 'text-emerald-400', emoji: '🚀', msg: 'Outstanding idea! High demand, low competition. Go create this now.' },
    Good:      { bg: 'from-blue-900/60 to-blue-800/30',   border: 'border-blue-500/40',   text: 'text-blue-400',    emoji: '✅', msg: 'Solid content idea with good potential. Worth pursuing with the right angle.' },
    Average:   { bg: 'from-yellow-900/50 to-yellow-800/20', border: 'border-yellow-500/30', text: 'text-yellow-400', emoji: '⚡', msg: 'Decent idea, but needs a unique angle to stand out from existing content.' },
    Poor:      { bg: 'from-red-900/50 to-red-800/20',      border: 'border-red-500/30',     text: 'text-red-400',    emoji: '⚠️', msg: 'High competition or low demand. Consider a different angle or niche.' },
  };
  const c = configs[verdict] || configs.Average;
  return (
    <div className={`bg-gradient-to-r ${c.bg} border ${c.border} rounded-2xl p-6 mb-8`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{c.emoji}</span>
            <span className={`text-2xl font-bold ${c.text}`}>{verdict} Idea</span>
          </div>
          <p className="text-gray-300">{c.msg}</p>
        </div>
        <div className="text-center">
          <div className={`text-5xl font-bold ${c.text}`}>{overallScore}</div>
          <div className="text-gray-400 text-sm">Overall Score</div>
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
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
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

  const TABS = ['overview', 'youtube', 'trends', 'ai-report', 'angles'];

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
          <p className="text-gray-500 text-sm">Analyzed on {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <VerdictBanner verdict={report.verdict} overallScore={report.overallScore} />

        {/* Score cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ScoreCard label="Competition" score={report.competitionScore} icon="⚔️" description="Higher = more saturated" />
          <ScoreCard label="Demand" score={report.demandScore} icon="🔥" description="Audience interest level" />
          <ScoreCard label="Originality" score={report.originalityScore} icon="💡" description="Uniqueness of the angle" />
          <ScoreCard label="Viral Potential" score={report.viralScore} icon="🚀" description="Likelihood to go viral" />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap capitalize ${
                activeTab === tab ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab === 'ai-report' ? 'Ai Report' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                        <span className="w-6 h-6 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
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
                <div key={i} className="card hover:border-gray-700 transition-all flex items-start gap-4">
                  {video.thumbnail && (
                    <img src={video.thumbnail} alt="" className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
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

          {/* TRENDS (replaces Reddit) */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-green-400" />
                <h3 className="text-white font-semibold">Demand Signals — Google Trends & Wikipedia</h3>
              </div>
              {report.redditResults?.length > 0 ? report.redditResults.map((post, i) => (
                <div key={i} className="card hover:border-gray-700 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-violet-400 transition-colors flex items-start gap-1">
                        {post.title} <ExternalLink size={12} className="flex-shrink-0 mt-1" />
                      </a>
                      <p className="text-green-400 text-xs mt-1">
                        {post.source || post.subreddit}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-3">
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><TrendingUp size={12} /> Interest score: {formatNumber(Math.round(post.upvotes))}</span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Relevance</span>
                      <span>{Math.round((post.upvoteRatio || 0) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full">
                      <div className="h-1.5 bg-green-400 rounded-full" style={{ width: `${(post.upvoteRatio || 0) * 100}%` }} />
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
                <h3 className="text-white font-semibold">AI-Generated Report by Groq</h3>
              </div>
              {report.aiReport && Object.keys(report.aiReport).some(k => report.aiReport[k]) ? (
                <>
                  {[
                    { key: 'competitionAnalysis', title: '⚔️ Competition Analysis', color: 'border-orange-500/30' },
                    { key: 'audienceInterestAnalysis', title: '👥 Audience Interest', color: 'border-blue-500/30' },
                    { key: 'originalityAssessment', title: '💡 Originality Assessment', color: 'border-yellow-500/30' },
                    { key: 'viralPotential', title: '🚀 Viral Potential', color: 'border-emerald-500/30' },
                    { key: 'suggestedImprovements', title: '📈 Suggested Improvements', color: 'border-violet-500/30' },
                  ].map(section => report.aiReport[section.key] && (
                    <div key={section.key} className={`card border-l-4 ${section.color}`}>
                      <h4 className="text-white font-semibold mb-2">{section.title}</h4>
                      <p className="text-gray-300 leading-relaxed">{report.aiReport[section.key]}</p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="card text-center py-12">
                  <Brain size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">AI report unavailable. Check that GROQ_API_KEY is set on Render.</p>
                </div>
              )}
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
                    <div key={i} className="card hover:border-violet-500/50 transition-all group cursor-pointer" onClick={() => navigator.clipboard.writeText(angle)}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm group-hover:bg-violet-500/30 transition-colors">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{angle}</p>
                          <p className="text-gray-600 text-xs mt-2 group-hover:text-gray-500 transition-colors">Click to copy</p>
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
