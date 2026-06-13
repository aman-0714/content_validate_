import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  LayoutDashboard, Trash2, Search, BarChart3,
  Zap, ExternalLink, Plus, TrendingUp, Star, Activity
} from 'lucide-react';

// ─── Animated count-up stat card ─────────────────────────────────────────────
const StatCard = ({ value, label, icon: Icon, accent, delay }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !value) return;
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    let current = 0;
    const step = 16;
    const inc = target / (700 / step);
    const t = setInterval(() => {
      current += inc;
      if (current >= target) { setDisplay(target); clearInterval(t); }
      else setDisplay(Math.round(current * 10) / 10);
    }, step);
    return () => clearInterval(t);
  }, [visible, value]);

  return (
    <div
      ref={ref}
      className={`fade-in-up ${delay}`}
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${accent}33`;
        e.currentTarget.style.boxShadow = `0 0 20px ${accent}14`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}22` }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none stat-pop" style={{ animationDelay: delay ? `${parseInt(delay.replace('delay-','')) * 60}ms` : '0' }}>
          {display}
        </p>
        <p className="text-slate-500 text-xs mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
};

// ─── Verdict badge ────────────────────────────────────────────────────────────
const VerdictBadge = ({ verdict }) => {
  const styles = {
    Excellent: { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' },
    Good:      { background: 'rgba(59,130,246,0.12)',  color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)' },
    Average:   { background: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.25)' },
    Poor:      { background: 'rgba(239,68,68,0.12)',  color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' },
  };
  const s = styles[verdict] || styles.Average;
  return (
    <span style={{ ...s, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
      {verdict}
    </span>
  );
};

// ─── Mini score pill ──────────────────────────────────────────────────────────
const ScorePill = ({ score, type }) => {
  const color =
    type === 'competition'
      ? score > 70 ? '#F87171' : score > 40 ? '#FBBF24' : '#10B981'
      : score > 70 ? '#10B981' : score > 40 ? '#60A5FA' : '#FBBF24';

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-semibold text-sm" style={{ color }}>{score}</span>
      <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-1 rounded-full bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchData(); }, [search, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analysesRes, statsRes] = await Promise.all([
        api.get(`/dashboard/analyses?search=${search}&page=${page}&limit=8`),
        api.get('/dashboard/stats'),
      ]);
      setAnalyses(analysesRes.data.data);
      setPagination(analysesRes.data.pagination);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis?')) return;
    setDeleting(id);
    try {
      await api.delete(`/dashboard/analyses/${id}`);
      setAnalyses(prev => prev.filter(a => a._id !== id));
      setStats(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
    } catch { alert('Failed to delete analysis'); }
    finally { setDeleting(null); }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: '#0B0F1A' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard size={18} style={{ color: '#00D4FF' }} />
              <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Welcome back, <span className="text-slate-300 font-medium">{user?.name}</span> 👋
            </p>
          </div>
          <Link to="/analyzer" className="btn-primary glow">
            <Plus size={15} /> New Analysis
          </Link>
        </div>

        {/* ── Stat cards ─────────────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard value={stats.total}                    label="Total Analyses"  icon={BarChart3}   accent="#00D4FF" delay="delay-1" />
            <StatCard value={stats.avgOverall}               label="Average Score"   icon={Activity}    accent="#818CF8" delay="delay-2" />
            <StatCard value={stats.verdicts?.Excellent || 0} label="Excellent Ideas" icon={Star}        accent="#10B981" delay="delay-3" />
            <StatCard value={stats.verdicts?.Good || 0}      label="Good Ideas"      icon={TrendingUp}  accent="#60A5FA" delay="delay-4" />
          </div>
        )}

        {/* ── Search ─────────────────────────────────────────────────────────── */}
        <div className="relative mb-5 fade-in-up delay-5">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4B5563' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search analyses…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div className="flex-1 h-4 skeleton" />
                <div className="w-12 h-4 skeleton" />
                <div className="w-12 h-4 skeleton" />
                <div className="w-16 h-5 skeleton rounded-full" />
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div
            className="text-center py-20 fade-in"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <BarChart3 size={24} style={{ color: '#00D4FF' }} />
            </div>
            <p className="text-white font-semibold text-base mb-1">No analyses yet</p>
            <p className="text-slate-500 text-sm mb-6">Validate your first content idea to get started</p>
            <Link to="/analyzer" className="btn-primary inline-flex">
              <Zap size={15} /> Analyze an Idea
            </Link>
          </div>
        ) : (
          <div
            className="overflow-hidden fade-in-up"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Idea','Competition','Demand','Overall','Verdict','Date','Actions'].map((h, i) => (
                      <th
                        key={h}
                        className={`text-xs font-semibold uppercase tracking-widest px-5 py-3.5 ${
                          i === 0 ? 'text-left' : 'text-center'
                        } ${[1,2].includes(i) ? 'hidden md:table-cell' : ''} ${i === 5 ? 'hidden sm:table-cell' : ''}`}
                        style={{ color: '#475569', letterSpacing: '0.07em' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a, i) => (
                    <tr
                      key={a._id}
                      className="fade-in-up"
                      style={{
                        borderBottom: i < analyses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        animationDelay: `${i * 35}ms`,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Idea title */}
                      <td className="px-5 py-3.5">
                        <p className="text-slate-200 font-medium text-sm line-clamp-1 max-w-xs">{a.title}</p>
                      </td>

                      {/* Competition */}
                      <td className="px-5 py-3.5 text-center hidden md:table-cell">
                        <ScorePill score={a.competitionScore} type="competition" />
                      </td>

                      {/* Demand */}
                      <td className="px-5 py-3.5 text-center hidden md:table-cell">
                        <ScorePill score={a.demandScore} type="demand" />
                      </td>

                      {/* Overall */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-base font-bold" style={{ color: '#00D4FF' }}>{a.overallScore}</span>
                      </td>

                      {/* Verdict */}
                      <td className="px-5 py-3.5 text-center">
                        <VerdictBadge verdict={a.verdict} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                        <span className="text-xs" style={{ color: '#475569' }}>{formatDate(a.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/report/${a._id}`}
                            title="View Report"
                            style={{ color: '#475569', padding: '6px', borderRadius: '8px', display: 'flex', transition: 'color 0.15s, background 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#00D4FF'; e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(a._id)}
                            disabled={deleting === a._id}
                            title="Delete"
                            style={{ color: '#475569', padding: '6px', borderRadius: '8px', display: 'flex', transition: 'color 0.15s, background 0.15s', opacity: deleting === a._id ? 0.4 : 1 }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-xs" style={{ color: '#475569' }}>
                  {Math.min((page-1)*8+1, pagination.total)}–{Math.min(page*8, pagination.total)} of {pagination.total}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(p-1,1))}         disabled={page === 1}               className="btn-secondary py-1.5 px-3 text-xs">Prev</button>
                  <button onClick={() => setPage(p => Math.min(p+1, pagination.pages))} disabled={page === pagination.pages} className="btn-secondary py-1.5 px-3 text-xs">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
