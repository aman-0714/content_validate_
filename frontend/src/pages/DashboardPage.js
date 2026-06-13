import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  Zap, ExternalLink, Trash2, Search, BarChart3,
  Plus, TrendingUp, Star, Activity, Sparkles,
  ArrowUpRight, Target, Brain, Layers
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

/* ── Animated count-up ─────────────────────────────────────────────────────── */
const CountUp = ({ value, suffix = '' }) => {
  const [n, setN] = useState(0);
  const ref = useRef(); const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold:.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!vis || !value) return;
    const t = typeof value === 'number' ? value : parseFloat(value) || 0;
    let c = 0; const inc = t / (650/16);
    const iv = setInterval(() => {
      c += inc;
      if (c >= t) { setN(t); clearInterval(iv); }
      else setN(Math.round(c * 10) / 10);
    }, 16);
    return () => clearInterval(iv);
  }, [vis, value]);

  return <span ref={ref}>{n}{suffix}</span>;
};

/* ── Verdict badge ─────────────────────────────────────────────────────────── */
const VerdictBadge = ({ verdict }) => {
  const map = {
    Excellent: 'badge badge-green',
    Good:      'badge badge-blue',
    Average:   'badge badge-amber',
    Poor:      'badge badge-red',
  };
  return <span className={map[verdict] || 'badge badge-amber'}>{verdict}</span>;
};

/* ── Circular score ring ───────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 56, stroke = 5 }) => {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 200); return () => clearTimeout(t); }, []);

  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off  = drawn ? ((100 - score) / 100) * circ : circ;
  const col  = score >= 75 ? '#10B981' : score >= 55 ? '#6366F1' : score >= 35 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off}
          style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter:`drop-shadow(0 0 6px ${col}88)` }}
        />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:size > 50 ? 14 : 11, fontWeight:800, color:col }}>{score}</span>
      </div>
    </div>
  );
};

/* ── Mini score bar ────────────────────────────────────────────────────────── */
const MiniBar = ({ score, label }) => {
  const col = score >= 75 ? '#10B981' : score >= 55 ? '#6366F1' : score >= 35 ? '#F59E0B' : '#EF4444';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, color:'#71717A', fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:11, color:col, fontWeight:700 }}>{score}</span>
      </div>
      <div style={{ height:3, background:'rgba(255,255,255,.06)', borderRadius:99, overflow:'hidden' }}>
        <div className="bar-fill" style={{ height:3, borderRadius:99, background:col, width:`${score}%` }}/>
      </div>
    </div>
  );
};

/* ── Custom tooltip for sparkline ─────────────────────────────────────────── */
const SparkTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#18181C', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#A78BFA', fontWeight:700 }}>
      {payload[0].value}
    </div>
  );
};

/* ── Analysis card ─────────────────────────────────────────────────────────── */
const AnalysisCard = ({ a, idx, onDelete, deleting, formatDate }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="fade-in-up"
      style={{
        animationDelay: `${idx * 45}ms`,
        background: hover ? '#161619' : '#141418',
        border: `1px solid ${hover ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.06)'}`,
        borderRadius: 16,
        padding: '1.25rem',
        transition: 'all .2s',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,.5)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
        <p style={{ color:'#FAFAFA', fontWeight:600, fontSize:'.875rem', lineHeight:1.4, flex:1,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {a.title}
        </p>
        <VerdictBadge verdict={a.verdict} />
      </div>

      {/* Score bars */}
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        <MiniBar score={a.demandScore}      label="Demand" />
        <MiniBar score={a.competitionScore} label="Competition" />
        <MiniBar score={a.originalityScore} label="Originality" />
      </div>

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid rgba(255,255,255,.05)', marginTop:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <ScoreRing score={a.overallScore} size={44} stroke={4} />
          <div>
            <p style={{ fontSize:10, color:'#52525B', fontWeight:500, letterSpacing:'.05em', textTransform:'uppercase' }}>Overall</p>
            <p style={{ fontSize:11, color:'#71717A' }}>{formatDate(a.createdAt)}</p>
          </div>
        </div>

        <div style={{ display:'flex', gap:4 }}>
          <Link
            to={`/report/${a._id}`}
            title="View report"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:8,
              background:'rgba(139,92,246,.08)', border:'1px solid rgba(139,92,246,.15)', color:'#8B5CF6',
              transition:'all .15s', textDecoration:'none' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(139,92,246,.18)'; e.currentTarget.style.borderColor='rgba(139,92,246,.4)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(139,92,246,.08)'; e.currentTarget.style.borderColor='rgba(139,92,246,.15)'; }}
          >
            <ExternalLink size={13} />
          </Link>
          <button
            onClick={() => onDelete(a._id)}
            disabled={deleting === a._id}
            title="Delete"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:8,
              background:'transparent', border:'1px solid rgba(255,255,255,.06)', color:'#52525B',
              cursor: deleting === a._id ? 'not-allowed' : 'pointer', opacity: deleting === a._id ? .4 : 1,
              transition:'all .15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,.1)'; e.currentTarget.style.color='#F87171'; e.currentTarget.style.borderColor='rgba(239,68,68,.25)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#52525B'; e.currentTarget.style.borderColor='rgba(255,255,255,.06)'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main ──────────────────────────────────────────────────────────────────── */
const DashboardPage = () => {
  const { user }  = useAuth();
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
      const [aRes, sRes] = await Promise.all([
        api.get(`/dashboard/analyses?search=${search}&page=${page}&limit=9`),
        api.get('/dashboard/stats'),
      ]);
      setAnalyses(aRes.data.data);
      setPagination(aRes.data.pagination);
      setStats(sRes.data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis?')) return;
    setDeleting(id);
    try {
      await api.delete(`/dashboard/analyses/${id}`);
      setAnalyses(p => p.filter(a => a._id !== id));
      setStats(p => p ? { ...p, total: p.total - 1 } : p);
    } catch { alert('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

  // Build sparkline from recent analyses
  const sparkData = [...analyses].reverse().slice(-8).map((a, i) => ({ i, score: a.overallScore }));

  const bestScore  = stats ? Math.max(...(analyses.map(a => a.overallScore)), 0) : 0;
  const successRate = stats && stats.total > 0
    ? Math.round(((stats.verdicts?.Excellent || 0) + (stats.verdicts?.Good || 0)) / stats.total * 100)
    : 0;

  return (
    <div style={{ minHeight:'100vh', background:'#09090B', position:'relative', overflow:'hidden' }}>

      {/* Ambient blobs */}
      <div className="blob" style={{ width:500, height:500, background:'#7C3AED', top:-120, left:-120, animationDelay:'0s' }} />
      <div className="blob" style={{ width:400, height:400, background:'#4F46E5', top:60, right:-80, animationDelay:'3s' }} />
      <div className="blob" style={{ width:300, height:300, background:'#6D28D9', bottom:100, left:'40%', animationDelay:'5s' }} />

      <Navbar />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'2.5rem 1.5rem', position:'relative', zIndex:1 }}>

        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <div className="fade-up" style={{ marginBottom:'2.5rem' }}>
          {/* Eyebrow */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:16,
            background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.2)',
            borderRadius:99, padding:'5px 14px' }}>
            <Sparkles size={12} color="#A78BFA" />
            <span style={{ fontSize:11, fontWeight:700, color:'#A78BFA', letterSpacing:'.07em', textTransform:'uppercase' }}>
              AI Content Intelligence
            </span>
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:16 }}>
            <div>
              <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.25rem)', fontWeight:800, letterSpacing:'-.03em',
                color:'#FAFAFA', lineHeight:1.15, marginBottom:8 }}>
                Validate Your Next<br />
                <span style={{ background:'linear-gradient(135deg,#C4B5FD,#8B5CF6,#6366F1)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  Big Content Idea
                </span>
              </h1>
              <p style={{ fontSize:14, color:'#71717A', fontWeight:400 }}>
                Welcome back, <span style={{ color:'#A1A1AA', fontWeight:600 }}>{user?.name}</span>
              </p>
            </div>
            <Link to="/analyzer" className="btn-primary" style={{ fontSize:'.875rem', padding:'.65rem 1.4rem' }}>
              <Plus size={16} /> New Analysis
            </Link>
          </div>
        </div>

        {/* ── Bento grid ───────────────────────────────────────────────────── */}
        {stats && (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(12, 1fr)',
            gridTemplateRows:'auto',
            gap:12,
            marginBottom:'2rem',
          }}>

            {/* Total analyses — spans 3 cols */}
            {[
              { icon: Layers,    label:'Total Analyses',  val:stats.total,                    suffix:'',  accent:'#8B5CF6', span:3 },
              { icon: Activity,  label:'Avg. Score',      val:stats.avgOverall,               suffix:'',  accent:'#6366F1', span:3 },
              { icon: Star,      label:'Excellent Ideas', val:stats.verdicts?.Excellent || 0, suffix:'',  accent:'#10B981', span:3 },
              { icon: TrendingUp,label:'Success Rate',    val:successRate,                    suffix:'%', accent:'#F59E0B', span:3 },
            ].map(({ icon: Icon, label, val, suffix, accent, span }, i) => (
              <div
                key={label}
                className="fade-in-up"
                style={{
                  gridColumn: `span ${span}`,
                  animationDelay: `${i * 60}ms`,
                  background: '#141418',
                  border: '1px solid rgba(255,255,255,.06)',
                  borderRadius: 16,
                  padding: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'border-color .2s, box-shadow .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}33`; e.currentTarget.style.boxShadow=`0 0 24px ${accent}12`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.06)'; e.currentTarget.style.boxShadow='none'; }}
              >
                <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  background:`${accent}18`, border:`1px solid ${accent}28` }}>
                  <Icon size={18} color={accent} />
                </div>
                <div>
                  <p className="stat-pop" style={{ fontSize:'1.6rem', fontWeight:800, color:'#FAFAFA', lineHeight:1,
                    animationDelay:`${i*70}ms` }}>
                    <CountUp value={val} suffix={suffix} />
                  </p>
                  <p style={{ fontSize:11, color:'#52525B', fontWeight:500, marginTop:2 }}>{label}</p>
                </div>
              </div>
            ))}

            {/* Sparkline card — spans 8 cols */}
            <div className="fade-in-up delay-4" style={{
              gridColumn:'span 8', background:'#141418',
              border:'1px solid rgba(255,255,255,.06)', borderRadius:16, padding:'1.25rem',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#FAFAFA' }}>Score Trend</p>
                  <p style={{ fontSize:11, color:'#52525B' }}>Last {sparkData.length} analyses</p>
                </div>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase',
                  background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.2)', color:'#A78BFA',
                  padding:'3px 10px', borderRadius:99 }}>LIVE</span>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={sparkData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="i" hide />
                  <Tooltip content={<SparkTooltip />} cursor={{ stroke:'rgba(139,92,246,.2)', strokeWidth:1 }} />
                  <Line type="monotone" dataKey="score" stroke="url(#lineGrad)" strokeWidth={2.5}
                    dot={false} activeDot={{ r:4, fill:'#8B5CF6', strokeWidth:0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* AI insight card — spans 4 cols */}
            <div className="fade-in-up delay-5" style={{
              gridColumn:'span 4',
              background: 'linear-gradient(135deg, rgba(139,92,246,.1) 0%, rgba(99,102,241,.06) 100%)',
              border:'1px solid rgba(139,92,246,.2)', borderRadius:16, padding:'1.25rem',
              display:'flex', flexDirection:'column', justifyContent:'space-between',
              boxShadow:'0 0 32px rgba(139,92,246,.06)',
            }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'rgba(139,92,246,.2)',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Brain size={14} color="#A78BFA" />
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:'#A78BFA' }}>AI Insight</span>
                </div>
                <p style={{ fontSize:13, color:'#D4D4D8', lineHeight:1.55, marginBottom:12 }}>
                  {successRate >= 70
                    ? `Strong portfolio! ${successRate}% of your ideas score Good or better. Try targeting Excellent ideas for higher reach.`
                    : successRate >= 40
                    ? `You're improving! Focus on higher-demand niches with lower competition for better scores.`
                    : `Your recent ideas need more niche specificity. Try narrowing your topic focus for better results.`}
                </p>
              </div>
              <Link to="/analyzer" style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600,
                color:'#A78BFA', textDecoration:'none', transition:'gap .15s' }}
                onMouseEnter={e=>e.currentTarget.style.gap='10px'}
                onMouseLeave={e=>e.currentTarget.style.gap='6px'}>
                Analyze new idea <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="fade-in-up delay-5" style={{ position:'relative', marginBottom:'1.5rem' }}>
          <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#52525B' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft:'2.75rem', background:'#141418', borderColor:'rgba(255,255,255,.07)' }}
            placeholder="Search your analyses…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* ── Section header ───────────────────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Target size={15} color="#8B5CF6" />
            <span style={{ fontSize:14, fontWeight:600, color:'#FAFAFA' }}>Recent Analyses</span>
            {pagination.total > 0 && (
              <span style={{ fontSize:11, background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.2)',
                color:'#A78BFA', borderRadius:99, padding:'1px 9px', fontWeight:600 }}>
                {pagination.total}
              </span>
            )}
          </div>
          <Link to="/history" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:500,
            color:'#71717A', textDecoration:'none', transition:'color .15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#A78BFA'}
            onMouseLeave={e=>e.currentTarget.style.color='#71717A'}>
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* ── Cards grid ───────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height:220 }} />)}
          </div>
        ) : analyses.length === 0 ? (
          <div style={{
            background:'#141418', border:'1px solid rgba(255,255,255,.06)',
            borderRadius:20, padding:'5rem 2rem', textAlign:'center',
          }} className="fade-in-up">
            <div style={{ width:56, height:56, borderRadius:16, background:'rgba(139,92,246,.1)',
              border:'1px solid rgba(139,92,246,.2)', display:'flex', alignItems:'center',
              justifyContent:'center', margin:'0 auto 1.25rem' }}>
              <BarChart3 size={22} color="#8B5CF6" />
            </div>
            <p style={{ color:'#FAFAFA', fontWeight:700, fontSize:'1.1rem', marginBottom:6 }}>
              {search ? 'No results found' : 'No analyses yet'}
            </p>
            <p style={{ color:'#52525B', fontSize:13, marginBottom:'1.5rem' }}>
              {search ? 'Try different search terms.' : 'Validate your first content idea to get started.'}
            </p>
            <Link to="/analyzer" className="btn-primary" style={{ display:'inline-flex' }}>
              <Zap size={14} /> Analyze an Idea
            </Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {analyses.map((a, i) => (
              <AnalysisCard key={a._id} a={a} idx={i} onDelete={handleDelete}
                deleting={deleting} formatDate={formatDate} />
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            marginTop:'1.5rem', paddingTop:'1.25rem', borderTop:'1px solid rgba(255,255,255,.06)' }}>
            <span style={{ fontSize:12, color:'#52525B' }}>
              {Math.min((page-1)*9+1, pagination.total)}–{Math.min(page*9,pagination.total)} of {pagination.total}
            </span>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page===1}
                className="btn-secondary" style={{ padding:'.4rem 1rem', fontSize:12 }}>← Prev</button>
              <button onClick={()=>setPage(p=>Math.min(p+1,pagination.pages))} disabled={page===pagination.pages}
                className="btn-secondary" style={{ padding:'.4rem 1rem', fontSize:12 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
