import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  Zap, Search, Lightbulb, TrendingUp, Target, Brain,
  Sparkles, ArrowRight, CheckCircle, RefreshCw, X, AlertTriangle
} from 'lucide-react';

const EXAMPLE_IDEAS = [
  'How Electrical Engineers Can Learn DSA',
  'Python for Data Science Beginners',
  'How to Build a SaaS in 30 Days',
  'Freelancing Tips for College Students',
  'Machine Learning Roadmap 2024',
];

// ── Stop words that alone don't make a content idea ──────────────────────────
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','is','are','was','were','this','that',
  'these','those','it','its','for','to','of','in','on','at','by','with',
  'i','me','my','we','you','he','she','they','do','did','be','been','being',
  'have','has','had','will','would','could','should','may','might','shall',
  'very','so','just','really','quite','also','too','not','no','yes','hi',
  'hello','hey','test','abc','def','ghi','xyz','ok','okay','lol','asdf',
]);

/**
 * Client-side idea meaningfulness check.
 * Returns { valid: true } or { valid: false, reason: string }
 */
const checkIdeaMeaningfulness = (raw) => {
  const trimmed = raw.trim();

  // 1. Too short
  if (trimmed.length < 8) {
    return { valid: false, reason: 'Your idea is too short. Please describe the topic you want to create content about.' };
  }

  // 2. Single character repeated (e.g. "aaaaaaa", "........")
  if (/^(.)\1+$/.test(trimmed)) {
    return { valid: false, reason: 'That doesn\'t look like a content idea. Try something like "Beginner Guide to React Hooks".' };
  }

  // 3. No real letters at all (pure symbols / numbers)
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, reason: 'Please enter a content idea using words, not just symbols or numbers.' };
  }

  // 4. Tokenise and check meaningful word ratio
  const words = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { valid: false, reason: 'Please enter a content idea with at least one real word.' };
  }

  const meaningful = words.filter(w => w.length > 2 && !STOP_WORDS.has(w));

  // 5. Zero meaningful words (e.g. "this or that", "hi hello ok")
  if (meaningful.length === 0) {
    return {
      valid: false,
      reason: 'Your input contains only common words with no clear topic. Please describe the actual subject of your content idea.',
    };
  }

  // 6. Repetition (e.g. "test test test", "this this this")
  const unique = new Set(words);
  if (words.length > 2 && unique.size / words.length < 0.5) {
    return { valid: false, reason: 'Your idea has too many repeated words. Please enter a clear, distinct content topic.' };
  }

  // 7. Random key-mash detection — high ratio of 1-2 char tokens or no vowels in long words
  const longWords = meaningful.filter(w => w.length >= 4);
  const noVowel = longWords.filter(w => !/[aeiou]/.test(w));
  if (longWords.length > 0 && noVowel.length / longWords.length > 0.6) {
    return { valid: false, reason: 'That looks like random characters. Please type a real content topic you want to validate.' };
  }

  return { valid: true };
};

// ── Idea Enhancer panel ───────────────────────────────────────────────────────
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
          {loading
            ? <><RefreshCw size={15} className="animate-spin" /> Enhancing…</>
            : <><Sparkles size={15} /> Enhance This Idea</>}
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
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 1,
                    background: 'rgba(139,92,246,.15)', color: '#A78BFA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>{i + 1}</div>
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

// ── Validation error callout ──────────────────────────────────────────────────
const ValidationError = ({ message, suggestions }) => (
  <div className="mt-3 rounded-xl px-4 py-3 flex gap-3"
    style={{ background: 'rgba(251,191,36,.07)', border: '1px solid rgba(251,191,36,.25)' }}>
    <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-semibold" style={{ color: '#FCD34D' }}>{message}</p>
      {suggestions && suggestions.length > 0 && (
        <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>
          Try something like: <span className="text-gray-300 italic">{suggestions.join(' · ')}</span>
        </p>
      )}
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const AnalyzerPage = () => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null); // { message, suggestions? }
  const [apiError, setApiError] = useState('');
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [enhancedIdea, setEnhancedIdea] = useState('');
  const navigate = useNavigate();

  const activeIdea = enhancedIdea || idea;

  // Live hint while typing (debounce-free — just on blur)
  const handleBlur = useCallback(() => {
    const val = (enhancedIdea || idea).trim();
    if (!val) { setValidationError(null); return; }
    const check = checkIdeaMeaningfulness(val);
    if (!check.valid) setValidationError({ message: check.reason });
    else setValidationError(null);
  }, [idea, enhancedIdea]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const val = activeIdea.trim();
    if (!val) {
      setValidationError({
        message: 'Please enter a content idea before validating.',
        suggestions: EXAMPLE_IDEAS.slice(0, 2),
      });
      return;
    }

    // Client-side check first — instant, no API cost
    const clientCheck = checkIdeaMeaningfulness(val);
    if (!clientCheck.valid) {
      setValidationError({
        message: clientCheck.reason,
        suggestions: EXAMPLE_IDEAS.slice(0, 2),
      });
      return;
    }

    setValidationError(null);
    setLoading(true);

    try {
      const { data } = await api.post('/analysis/analyze', { title: val });
      navigate(`/report/${data.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed. Please try again.';

      // Backend sent a validation rejection (400) — show as validation callout, not generic error
      if (err.response?.status === 400) {
        setValidationError({
          message: msg,
          suggestions: EXAMPLE_IDEAS.slice(0, 2),
        });
      } else {
        setApiError(msg);
      }
      setLoading(false);
    }
  };

  const handleExample = (ex) => {
    setIdea(ex); setEnhancedIdea('');
    setValidationError(null); setApiError('');
    setShowEnhancer(false);
  };

  const handleSelectEnhanced = (title) => {
    setEnhancedIdea(title);
    setValidationError(null); setApiError('');
    setShowEnhancer(false);
  };

  const handleIdeaChange = (val) => {
    setIdea(val); setEnhancedIdea('');
    setValidationError(null); setApiError('');
    if (showEnhancer) setShowEnhancer(false);
  };

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
          <p className="text-gray-400 text-lg">
            Enter your idea, optionally enhance it with AI, then validate it with live data.
          </p>
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
            <button onClick={() => { setEnhancedIdea(''); setValidationError(null); }}
              className="btn-ghost" style={{ padding: '2px 6px' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative">
            <Search size={20} style={{
              position: 'absolute', left: 18, top: '50%',
              transform: 'translateY(-50%)', color: '#52525B',
            }} />
            <input
              type="text"
              value={enhancedIdea || idea}
              onChange={e => handleIdeaChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. How Electrical Engineers Can Learn DSA"
              className="input-field"
              style={{
                paddingLeft: '3rem', paddingTop: '1.1rem',
                paddingBottom: '1.1rem', fontSize: '1rem', borderRadius: 14,
                borderColor: validationError ? 'rgba(251,191,36,.5)' : undefined,
              }}
              maxLength={200}
              autoComplete="off"
              spellCheck="true"
            />
          </div>

          {/* Validation callout (amber — guidance tone, not error) */}
          {validationError && (
            <ValidationError
              message={validationError.message}
              suggestions={validationError.suggestions}
            />
          )}

          {/* Generic API error (network / 5xx) */}
          {apiError && !validationError && (
            <p className="text-sm mt-3 ml-1" style={{ color: '#F87171' }}>{apiError}</p>
          )}

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary flex-1" style={{ padding: '.85rem', fontSize: '.95rem' }}>
              <Zap size={18} /> Validate This Idea
            </button>
            {idea.trim().length > 5 && !enhancedIdea && (
              <button
                type="button"
                onClick={() => setShowEnhancer(v => !v)}
                className={showEnhancer ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '.85rem 1.2rem', whiteSpace: 'nowrap' }}
              >
                <Sparkles size={15} />
                <span className="hidden sm:inline">Enhance</span>
              </button>
            )}
          </div>
        </form>

        {showEnhancer && idea.trim().length > 5 && (
          <IdeaEnhancer
            originalIdea={idea.trim()}
            onSelectIdea={handleSelectEnhanced}
            onClose={() => setShowEnhancer(false)}
          />
        )}

        {/* Examples */}
        <div className="mt-6 mb-12">
          <p className="text-sm mb-3 flex items-center gap-2" style={{ color: '#52525B' }}>
            <Lightbulb size={13} /> Try an example:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_IDEAS.map(ex => (
              <button
                key={ex}
                onClick={() => handleExample(ex)}
                className="btn-ghost"
                style={{ fontSize: 12, padding: '6px 12px', border: '1px solid rgba(255,255,255,.08)' }}
              >
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
