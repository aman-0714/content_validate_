import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { LayoutDashboard, Trash2, Search, BarChart3, TrendingUp, Zap, ExternalLink } from 'lucide-react';

// ─── Animated stat card with count-up ────────────────────────────────────────
const StatCard = ({ value, label, color, delay }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !value) return;
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    let current = 0;
    const step = 16;
    const inc = target / (800 / step);
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
      className={`card text-center hover:border-gray-700 hover:scale-[1.02] transition-all duration-300 fade-in-up ${delay}`}
    >
      <p className={`text-3xl font-bold ${color} stat-pop`} style={{ animationDelay: delay ? `${parseInt(delay.replace('delay-', '')) * 50}ms` : '0ms' }}>
        {display}
      </p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </div>
  );
};

// ─── Verdict badge ────────────────────────────────────────────────────────────
const VerdictBadge = ({ verdict }) => {
  const colors = {
    Excellent: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Good:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Average:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Poor:      'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${colors[verdict] || colors.Average}`}>
      {verdict}
    </span>
  );
};

// ─── Mini score bar ───────────────────────────────────────────────────────────
const MiniScoreBar = ({ score, color }) => (
  <div className="flex items-center gap-2">
    <span className={`font-semibold text-sm ${color}`}>{score}</span>
    <div className="w-10 h-1.5 bg-gray-800 rounded-full overflow-hidden hidden lg:block">
      <div className={`h-1.5 rounded-full bar-fill ${color.replace('text-', 'bg-')}`} style={{ width: `${score}%` }} />
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchData(); }, [search, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analysesRes, statsRes] = await Promise.all([
        api.get(`/dashboard/analyses?search=${search}&page=${page}&limit=8`),
        api.get('/dashboard/stats')
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
    } catch (err) {
      alert('Failed to delete analysis');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="text-violet-400" /> Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name} 👋</p>
          </div>
          <Link to="/analyzer" className="btn-primary flex items-center gap-2 glow">
            <Zap size={18} /> New Analysis
          </Link>
        </div>

        {/* Stat cards with count-up */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard value={stats.total}                   label="Total Analyses"  color="text-violet-400"  delay="delay-1" />
            <StatCard value={stats.avgOverall}              label="Avg. Score"      color="text-blue-400"    delay="delay-2" />
            <StatCard value={stats.verdicts?.Excellent || 0} label="Excellent Ideas" color="text-emerald-400" delay="delay-3" />
            <StatCard value={stats.verdicts?.Good || 0}     label="Good Ideas"      color="text-yellow-400"  delay="delay-4" />
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-6 fade-in-up delay-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="input-field pl-11"
            placeholder="Search your analyses..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="card p-0 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-800 last:border-0">
                <div className="flex-1 h-4 skeleton" />
                <div className="w-10 h-4 skeleton" />
                <div className="w-10 h-4 skeleton" />
                <div className="w-16 h-6 skeleton rounded-full" />
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="card text-center py-20 fade-in-up">
            <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">No analyses yet</p>
            <p className="text-gray-600 text-sm mt-1 mb-6">Validate your first content idea to get started</p>
            <Link to="/analyzer" className="btn-primary inline-flex items-center gap-2">
              <Zap size={16} /> Analyze an Idea
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden p-0 fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Idea</th>
                    <th className="text-center text-gray-400 text-sm font-medium px-4 py-4 hidden md:table-cell">Competition</th>
                    <th className="text-center text-gray-400 text-sm font-medium px-4 py-4 hidden md:table-cell">Demand</th>
                    <th className="text-center text-gray-400 text-sm font-medium px-4 py-4">Overall</th>
                    <th className="text-center text-gray-400 text-sm font-medium px-4 py-4">Verdict</th>
                    <th className="text-center text-gray-400 text-sm font-medium px-4 py-4 hidden sm:table-cell">Date</th>
                    <th className="text-center text-gray-400 text-sm font-medium px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a, i) => (
                    <tr
                      key={a._id}
                      className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors fade-in-up ${i === analyses.length - 1 ? 'border-0' : ''}`}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <p className="text-white font-medium text-sm line-clamp-1 max-w-xs">{a.title}</p>
                      </td>
                      <td className="px-4 py-4 text-center hidden md:table-cell">
                        <MiniScoreBar score={a.competitionScore} color="text-orange-400" />
                      </td>
                      <td className="px-4 py-4 text-center hidden md:table-cell">
                        <MiniScoreBar score={a.demandScore} color="text-blue-400" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-violet-400 font-bold text-sm">{a.overallScore}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <VerdictBadge verdict={a.verdict} />
                      </td>
                      <td className="px-4 py-4 text-center hidden sm:table-cell">
                        <span className="text-gray-500 text-xs">{formatDate(a.createdAt)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/report/${a._id}`}
                            className="text-gray-500 hover:text-violet-400 transition-colors p-1.5 rounded-lg hover:bg-violet-500/10"
                            title="View Report"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(a._id)}
                            disabled={deleting === a._id}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 size={15} />
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
                <span className="text-gray-500 text-sm">
                  Showing {Math.min((page - 1) * 8 + 1, pagination.total)}–{Math.min(page * 8, pagination.total)} of {pagination.total}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Prev</button>
                  <button onClick={() => setPage(p => Math.min(p + 1, pagination.pages))} disabled={page === pagination.pages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next</button>
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
