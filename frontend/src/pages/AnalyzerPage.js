import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  Zap, Search, Lightbulb, TrendingUp, Target, Brain,
  Sparkles, ArrowRight, CheckCircle, RefreshCw, X
} from 'lucide-react';

const EXAMPLE_IDEAS = [
  'How Electrical Engineers Can Learn DSA',
  'Python for Data Science Beginners',
  'How to Build a SaaS in 30 Days',
  'Freelancing Tips for College Students',
  'Machine Learning Roadmap 2024',
];

const IdeaEnhancer = ({ originalIdea, onSelectIdea, onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const enhance = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/analysis/enhance-idea', { idea: originalIdea });
      setSuggestions(data.suggestions || []);
      setGenerated(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Enhancement failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="card-brand mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-yellow-400" />
          <span className="text-white font-semibold">Idea Enhancer</span>
          <span className="badge badge-purple" style={{ fontSize: 10 }}>AI</span>
        </div>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 6px' }}>
          <X size={16} />
        </button>
      </div>

      <div className="rounded-xl px-4 py-3 mb-4"
        style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
        <p className="text-xs mb-1" style={{ color: '#52525B' }}>Your original idea</p>
        <p className="text-gray-200 text-sm font-medium">"{originalIdea}"</p>
      </div>

      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
        The AI will refine your concept into <strong className="text-white">5 stronger variants</strong> — same intent, sharper framing, better click and search appeal.
      </p>

      {!generated && (
        <button onClick={enhance} disabled={loading} className="btn-primary w-full" style={{ padding: '.75rem' }}>
          {loading ? <><RefreshCw size={15} className="animate-spin" /> Enhancing…</> : <><Sparkles size={15} /> Enhance This Idea</>}
        </button>
      )}

      {error && <p className="text-sm mt-3" style={{ color: '#F87171' }}>{error}</p>}

      {generated && suggestions.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#52525B' }}>Choose a version to analyze:</p>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSelectIdea(s.title)} className="w-full text-left">
              <div className="card" style={{ padding: '12px 14px', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
                <div className="flex items-start gap-3">
                  <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 1,
                    background: 'rgba(139,92,246,.15)', color: '#A78BFA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{s.title}</p>
                    {s.reason && <p className="text-xs mt-1 leading-relaxed" style={{ color: '#52525B' }}>{s.reason}</p>}
                  </div>
                  <CheckCircle size={15} style={{ color: 'rgba(139,92,246,.4)', flexShrink: 0, marginTop: 2 }} />
                </div>
              </div>
            </button>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button onClick={enhance} className="btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }}>
              <RefreshCw size={11} /> Regenerate
            </button>
            <span style={{ color: '#3F3F46' }}>·</span>
            <button onClick={() => onSelectIdea(originalIdea)} className="btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }}>
              Keep original
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyzerPage = () => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [enhancedIdea, setEnhancedIdea] = useState('');
  const navigate = useNavigate();

  const activeIdea = enhancedIdea || idea;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeIdea.trim()) { setError('Please enter a content idea'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/analysis/analyze', { title: activeIdea.trim() });
      navigate(`/report/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  const handleExample = (ex) => { setIdea(ex); setEnhancedIdea(''); setError(''); setShowEnhancer(false); };
  const handleSelectEnhanced = (title) => { setEnhancedIdea(title); setShowEnhancer(false); };
  const handleIdeaChange = (val) => { setIdea(val); setEnhancedIdea(''); setError(''); if (showEnhancer) setShowEnhancer(false); };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090B' }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <LoadingSpinner message={`Analyzing: "${activeIdea}"`} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090B' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', color: '#A78BFA' }}>
            <Zap size={12} /> AI-Powered Content Validator
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            What's Your <span className="gradient-text">Content Idea?</span>
          </h1>
          <p className="text-gray-400 text-lg">Enter your idea, optionally enhance it with AI, then validate it with live data.</p>
        </div>

        {/* Enhanced idea badge */}
        {enhancedIdea && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)' }}>
            <Sparkles size={15} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#A78BFA' }}>Enhanced idea selected</p>
              <p className="text-white text-sm font-medium truncate">"{enhancedIdea}"</p>
            </div>
            <button onClick={() => setEnhancedIdea('')} className="btn-ghost" style={{ padding: '2px 6px' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative">
            <Search size={20} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#52525B' }} />
            <input
              type="text"
              value={enhancedIdea || idea}
              onChange={e => handleIdeaChange(e.target.value)}
              placeholder="e.g. How Electrical Engineers Can Learn DSA"
              className="input-field"
              style={{ paddingLeft: '3rem', paddingTop: '1.1rem', paddingBottom: '1.1rem', fontSize: '1rem', borderRadius: 14 }}
              maxLength={200}
            />
          </div>
          {error && <p className="text-sm mt-3 ml-1" style={{ color: '#F87171' }}>{error}</p>}

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary flex-1" style={{ padding: '.85rem', fontSize: '.95rem' }}>
              <Zap size={18} /> Validate This Idea
            </button>
            {idea.trim().length > 5 && !enhancedIdea && (
              <button type="button" onClick={() => setShowEnhancer(v => !v)}
                className={showEnhancer ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '.85rem 1.2rem', whiteSpace: 'nowrap' }}>
                <Sparkles size={15} />
                <span className="hidden sm:inline">Enhance</span>
              </button>
            )}
          </div>
        </form>

        {showEnhancer && idea.trim().length > 5 && (
          <IdeaEnhancer originalIdea={idea.trim()} onSelectIdea={handleSelectEnhanced} onClose={() => setShowEnhancer(false)} />
        )}

        {/* Examples */}
        <div className="mt-6 mb-12">
          <p className="text-sm mb-3 flex items-center gap-2" style={{ color: '#52525B' }}>
            <Lightbulb size={13} /> Try an example:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_IDEAS.map(ex => (
              <button key={ex} onClick={() => handleExample(ex)} className="btn-ghost"
                style={{ fontSize: 12, padding: '6px 12px', border: '1px solid rgba(255,255,255,.08)' }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* What you'll get */}
        <div className="card">
          <h3 className="text-white font-bold text-lg mb-5">What you'll get in your report:</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: <Target size={16} className="text-orange-400" />, label: 'Competition Score', desc: 'How saturated is this topic on YouTube' },
              { icon: <TrendingUp size={16} className="text-blue-400" />, label: 'Demand Score', desc: 'Google Trends & Wikipedia interest signals' },
              { icon: <Zap size={16} className="text-yellow-400" />, label: 'Viral Potential', desc: 'Likelihood of going viral based on data' },
              { icon: <Brain size={16} className="text-violet-400" />, label: 'AI Full Report', desc: 'Groq AI analysis with recommendations' },
              { icon: <Sparkles size={16} className="text-pink-400" />, label: 'Idea Enhancement', desc: 'AI-refined angles that score higher' },
              { icon: <ArrowRight size={16} className="text-emerald-400" />, label: 'Better Angles', desc: '5 differentiated content angle suggestions' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzerPage;
