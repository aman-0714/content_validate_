import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  History, Search, ExternalLink, Trash2, Download, Share2,
  Filter, SortDesc, Zap, BarChart3, TrendingUp, TrendingDown, Minus
} from 'lucide-react';

// ─── Verdict badge ─────────────────────────────────────────────────────────────
const VerdictBadge = ({ verdict }) => {
  const colors = {
    Excellent: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Good:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Average:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Poor:      'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors[verdict] || colors.Average}`}>{verdict}</span>;
};

// ─── Score trend icon ──────────────────────────────────────────────────────────
const ScoreTrend = ({ score }) => {
  if (score >= 70) return <TrendingUp size={14} className="text-emerald-400" />;
  if (score >= 40) return <Minus size={14} className="text-yellow-400" />;
  return <TrendingDown size={14} className="text-red-400" />;
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const HistoryPage = () => {
  const [analyses, setAnalyses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');           // all | Excellent | Good | Average | Poor
  const [sort, setSort]           = useState('newest');        // newest | oldest | score-high | score-low
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleting, setDeleting]   = useState(null);
  const [sharing, setSharing]     = useState(null);
  const [shareToast, setShareToast] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => { fetchData(); }, [search, page, filter, sort]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page,
        limit: 12,
        ...(filter !== 'all' && { verdict: filter }),
        sort
      });
      const res = await api.get(`/dashboard/analyses?${params}`);
      setAnalyses(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/dashboard/analyses/${id}`);
      setAnalyses(prev => prev.filter(a => a._id !== id));
    } catch { alert('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const handleShare = async (id) => {
    setSharing(id);
    try {
      const res = await api.post(`/export/${id}/share`);
      const token = res.data?.shareToken || res.data?.data?.shareToken;
      if (!token) throw new Error('No token returned');
      const link = `${window.location.origin}/shared/${token}`;
      // Try clipboard, fall back to prompt
      try {
        await navigator.clipboard.writeText(link);
        setShareToast('Link copied to clipboard!');
      } catch {
        window.prompt('Copy this share link:', link);
      }
      setTimeout(() => setShareToast(''), 3000);
    } catch (err) {
      console.error('Share error:', err);
      setShareToast('Failed to generate share link');
      setTimeout(() => setShareToast(''), 3000);
    } finally { setSharing(null); }
  };

  const handleDownloadPDF = async (id, title) => {
    setDownloading(id);
    try {
      const token = localStorage.getItem('token');
      // Use the same base URL as the api service to avoid host mismatch on production
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE}/api/export/${id}/pdf`, {
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
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').slice(0, 50)}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
      alert(`PDF generation failed: ${err.message}`);
    } finally { setDownloading(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Toast notification */}
        {shareToast && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, background: shareToast.includes('Failed') ? '#dc2626' : '#059669',
            color: 'white', padding: '10px 20px', borderRadius: 10,
            fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
          }}>
            {shareToast.includes('Failed') ? '❌' : '✅'} {shareToast}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <History className="text-violet-400" /> Analysis History
            </h1>
            <p className="text-gray-400 mt-1">All your past content idea analyses</p>
          </div>
          <Link to="/analyzer" className="btn-primary flex items-center gap-2 glow">
            <Zap size={18} /> New Analysis
          </Link>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-6 fade-in-up delay-1">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="input-field pl-9 py-2 text-sm"
              placeholder="Search by title…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Verdict filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              className="input-field pl-8 pr-8 py-2 text-sm appearance-none cursor-pointer"
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All verdicts</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <SortDesc size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              className="input-field pl-8 pr-8 py-2 text-sm appearance-none cursor-pointer"
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="score-high">Highest score</option>
              <option value="score-low">Lowest score</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-gray-500 text-sm mb-4 fade-in-up delay-2">
            {pagination.total || 0} result{pagination.total !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 skeleton rounded-2xl" />
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="card text-center py-20 fade-in-up">
            <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">No analyses found</p>
            <p className="text-gray-600 text-sm mt-1 mb-6">
              {search || filter !== 'all' ? 'Try adjusting your filters.' : 'Start by analyzing a content idea.'}
            </p>
            <Link to="/analyzer" className="btn-primary inline-flex items-center gap-2">
              <Zap size={16} /> Analyze an Idea
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyses.map((a, i) => (
                <div
                  key={a._id}
                  className="card hover:border-gray-700 transition-all duration-200 hover:scale-[1.01] fade-in-up flex flex-col"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Title */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-white font-medium text-sm line-clamp-2 flex-1">{a.title}</p>
                    <VerdictBadge verdict={a.verdict} />
                  </div>

                  {/* Scores mini row */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    {[
                      { label: 'Demand',      val: a.demandScore },
                      { label: 'Competition', val: a.competitionScore },
                      { label: 'Originality', val: a.originalityScore },
                      { label: 'Viral',       val: a.viralScore },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-gray-500 text-xs">{label}</span>
                          <span className="text-gray-300 text-xs font-semibold">{val}</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-1 rounded-full bar-fill ${val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall + date */}
                  <div className="flex items-center justify-between mt-auto mb-4">
                    <div className="flex items-center gap-2">
                      <ScoreTrend score={a.overallScore} />
                      <span className="text-violet-400 font-bold">{a.overallScore}</span>
                      <span className="text-gray-500 text-xs">/ 100</span>
                    </div>
                    <span className="text-gray-600 text-xs">{formatDate(a.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 border-t border-gray-800 pt-3">
                    <Link
                      to={`/report/${a._id}`}
                      className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1"
                      title="View report"
                    >
                      <ExternalLink size={12} /> View
                    </Link>
                    <button
                      onClick={() => handleDownloadPDF(a._id, a.title)}
                      disabled={downloading === a._id}
                      className="btn-secondary py-1.5 px-2.5 text-xs disabled:opacity-40"
                      title="Download PDF"
                    >
                      {downloading === a._id
                        ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        : <Download size={13} />}
                    </button>
                    <button
                      onClick={() => handleShare(a._id)}
                      disabled={sharing === a._id}
                      className="btn-secondary py-1.5 px-2.5 text-xs disabled:opacity-40"
                      title="Copy share link"
                    >
                      {sharing === a._id
                        ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        : <Share2 size={13} />}
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      disabled={deleting === a._id}
                      className="btn-secondary py-1.5 px-2.5 text-xs text-red-400 hover:border-red-500/40 disabled:opacity-40"
                      title="Delete"
                    >
                      {deleting === a._id
                        ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8 fade-in-up">
                <span className="text-gray-500 text-sm">
                  Page {page} of {pagination.pages}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(p + 1, pagination.pages))} disabled={page === pagination.pages} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
