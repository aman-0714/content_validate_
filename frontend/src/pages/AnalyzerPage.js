import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { Zap, Search, Lightbulb, TrendingUp, Target, Brain } from 'lucide-react';

const EXAMPLE_IDEAS = [
  'How Electrical Engineers Can Learn DSA',
  'Python for Data Science Beginners',
  'How to Build a SaaS in 30 Days',
  'Freelancing Tips for College Students',
  'Machine Learning Roadmap 2024',
];

const AnalyzerPage = () => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('Please enter a content idea');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/analysis/analyze', { title: idea.trim() });
      navigate(`/report/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  const handleExample = (example) => {
    setIdea(example);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <LoadingSpinner message={`Analyzing: "${idea}"`} />
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
            We'll search YouTube, Reddit, and use AI to give you a full validation report.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="e.g. How Electrical Engineers Can Learn DSA"
              className="w-full bg-gray-900 border-2 border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-2xl pl-14 pr-6 py-5 text-lg outline-none transition-all"
              maxLength={200}
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-3 ml-2">{error}</p>}
          <button type="submit" className="btn-primary w-full mt-4 py-4 text-lg flex items-center justify-center gap-2">
            <Zap size={20} /> Validate This Idea
          </button>
        </form>

        {/* Example ideas */}
        <div className="mb-12">
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
