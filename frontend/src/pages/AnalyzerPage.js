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

/* ─── Inline Idea Enhancer via Groq (backend proxy) ─── */
const IdeaEnhancer = ({ originalIdea, onSelectIdea, onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const enhance = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/analysis/enhance-idea', { idea: originalIdea });
      setSuggestions(data.suggestions || []);
      setGenerated(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Enhancement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-indigo-950/30 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-yellow-400" />
          <span className="text-white font-semibold">Idea Enhancer</span>
          <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">AI</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Original idea display */}
      <div className="bg-gray-900/60 rounded-xl px-4 py-3 mb-4 border border-gray-700/50">
        <p className="text-xs text-gray-500 mb-1">Your original idea</p>
        <p className="text-gray-200 text-sm font-medium">"{originalIdea}"</p>
      </div>

      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
        The AI will refine your concept into <strong className="text-white">5 stronger variants</strong> — same intent,
        sharper framing, better click and search appeal. Pick one to analyze.
      </p>

      {!generated && (
        <button
          onClick={enhance}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading
            ? <><RefreshCw size={16} className="animate-spin" /> Enhancing your idea...</>
            : <><Sparkles size={16} /> Enhance This Idea</>
          }
        </button>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      {/* Results */}
      {generated && suggestions.length > 0 && (
        <div className="space-y-3 mt-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Choose a version to analyze:
          </p>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelectIdea(s.title)}
              className="w-full text-left group"
            >
              <div className="bg-gray-900/70 hover:bg-violet-900/30 border border-gray-700 hover:border-violet-500/50 rounded-xl p-4 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:bg-violet-500/30 transition-colors mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm group-hover:text-violet-300 transition-colors">
                      {s.title}
                    </p>
                    {s.reason && (
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{s.reason}</p>
                    )}
                  </div>
                  <CheckCircle size={16} className="text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </div>
            </button>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={enhance}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <RefreshCw size={12} /> Regenerate
            </button>
            <span className="text-gray-700">·</span>
            <button
              onClick={() => onSelectIdea(originalIdea)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Keep original
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ─── */
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
    if (!activeIdea.trim()) {
      setError('Please enter a content idea');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/analysis/analyze', { title: activeIdea.trim() });
      navigate(`/report/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  const handleExample = (example) => {
    setIdea(example);
    setEnhancedIdea('');
    setError('');
    setShowEnhancer(false);
  };

  const handleSelectEnhanced = (title) => {
    setEnhancedIdea(title);
    setShowEnhancer(false);
  };

  const handleIdeaChange = (val) => {
    setIdea(val);
    setEnhancedIdea('');
    setError('');
    if (showEnhancer) setShowEnhancer(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <LoadingSpinner message={`Analyzing: "${activeIdea}"`} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm px-4 py-2 rounded-full mb-6">
            <Zap size={14} /> AI-Powered Content Validator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            What's Your <span className="gradient-text">Content Idea?</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Enter your idea, optionally enhance it with AI, then validate it with live data.
          </p>
        </div>

        {/* Enhanced idea badge */}
        {enhancedIdea && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/25">
            <Sparkles size={15} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-violet-400 font-semibold mb-0.5">Enhanced idea selected</p>
              <p className="text-white text-sm font-medium truncate">"{enhancedIdea}"</p>
            </div>
            <button onClick={() => { setEnhancedIdea(''); }} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative">
            <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={enhancedIdea || idea}
              onChange={e => handleIdeaChange(e.target.value)}
              placeholder="e.g. How Electrical Engineers Can Learn DSA"
              className="w-full bg-gray-900 border-2 border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-2xl pl-14 pr-6 py-5 text-lg outline-none transition-all"
              maxLength={200}
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-3 ml-2">{error}</p>}

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2">
              <Zap size={20} /> Validate This Idea
            </button>
            {idea.trim().length > 5 && !enhancedIdea && (
              <button
                type="button"
                onClick={() => setShowEnhancer(v => !v)}
                className={`flex items-center gap-2 px-5 py-4 rounded-xl font-semibold text-sm transition-all border ${
                  showEnhancer
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Sparkles size={16} />
                <span className="hidden sm:inline">Enhance Idea</span>
              </button>
            )}
          </div>
        </form>

        {/* Enhancer panel */}
        {showEnhancer && idea.trim().length > 5 && (
          <IdeaEnhancer
            originalIdea={idea.trim()}
            onSelectIdea={handleSelectEnhanced}
            onClose={() => setShowEnhancer(false)}
          />
        )}

        {/* Example ideas */}
        <div className="mb-12 mt-6">
          <p className="text-gray-500 text-sm mb-3 flex items-center gap-2">
            <Lightbulb size={14} /> Try an example:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_IDEAS.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExample(ex)}
                className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* What you'll get */}
        <div className="card">
          <h3 className="text-white font-semibold mb-5 text-lg">What you'll get in your report:</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: <Target size={18} className="text-orange-400" />, label: 'Competition Score', desc: 'How saturated is this topic on YouTube' },
              { icon: <TrendingUp size={18} className="text-blue-400" />, label: 'Demand Score', desc: 'Google Trends & Wikipedia interest signals' },
              { icon: <Zap size={18} className="text-yellow-400" />, label: 'Viral Potential', desc: 'Likelihood of going viral based on data' },
              { icon: <Brain size={18} className="text-violet-400" />, label: 'AI Full Report', desc: 'Groq AI analysis with recommendations' },
              { icon: <Sparkles size={18} className="text-pink-400" />, label: 'Idea Enhancement', desc: 'AI-refined angles that score higher' },
              { icon: <ArrowRight size={18} className="text-emerald-400" />, label: 'Better Angles', desc: '5 differentiated content angle suggestions' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
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
