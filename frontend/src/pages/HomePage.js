import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  Zap, ArrowRight, BarChart3, Brain, TrendingUp, Target,
  Youtube, Lightbulb, Sparkles, Clock
} from 'lucide-react';

const METRICS = [
  { value: '4',    label: 'Scoring Dimensions', icon: <BarChart3 size={20} className="text-violet-400" /> },
  { value: '10+',  label: 'YouTube Signals',    icon: <Youtube size={20} className="text-red-400" /> },
  { value: '<30s', label: 'Analysis Time',       icon: <Clock size={20} className="text-blue-400" /> },
  { value: 'AI',   label: 'Powered by Groq',    icon: <Brain size={20} className="text-emerald-400" /> },
];

const FEATURES = [
  { icon: <BarChart3 size={20} className="text-violet-400" />, title: 'Precision Scoring', desc: 'Four-axis scoring — Competition, Demand, Originality, and Viral Potential — calculated from live data, not guesses.' },
  { icon: <Lightbulb size={20} className="text-yellow-400" />, title: 'Idea Enhancement', desc: 'Our AI refines your raw concept into sharpened angles that keep your intent but dramatically lift search and click appeal.' },
  { icon: <Youtube size={20} className="text-red-400" />, title: 'YouTube Intelligence', desc: 'Surface the top 10 competing videos with views, likes, and channel data so you know exactly who you\'re up against.' },
  { icon: <TrendingUp size={20} className="text-blue-400" />, title: 'Trend Mapping', desc: 'Google Trends and Wikipedia pageviews reveal whether public interest is rising, peaking, or cooling — before you invest time.' },
  { icon: <Brain size={20} className="text-emerald-400" />, title: 'Full AI Report', desc: 'Groq\'s LLaMA model writes a structured analysis: competition landscape, audience interest, originality, and next steps.' },
  { icon: <Target size={20} className="text-pink-400" />, title: 'History & Compare', desc: 'Every report lives in your dashboard. Track how your content strategy evolves and compare ideas side by side.' },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#09090B' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-28 text-center px-6">
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.22) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: 100, left: 48, width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(139,92,246,.06)', filter: 'blur(72px)', pointerEvents: 'none',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: 60, right: 48, width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(99,102,241,.05)', filter: 'blur(60px)', pointerEvents: 'none',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', color: '#A78BFA' }}>
            <Sparkles size={12} /> AI Content Intelligence
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.08] tracking-tight">
            Know Before
            <br />
            <span className="gradient-text">You Create</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing. IdeaValidator scores every content idea against real YouTube data, Google Trends,
            and AI analysis — and then rewrites it to perform better.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link to={user ? '/analyzer' : '/signup'} className="btn-primary"
              style={{ fontSize: '1rem', padding: '.85rem 2rem' }}>
              {user ? 'Analyze an Idea' : 'Start for Free'} <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn-secondary"
              style={{ fontSize: '1rem', padding: '.85rem 2rem' }}>
              See how it works
            </a>
          </div>


        </div>
      </section>

      {/* Metrics */}
      <section className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map(({ value, label, icon }) => (
          <div key={label} className="card text-center">
            <div className="flex justify-center mb-3">{icon}</div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-gray-500 text-xs font-medium">{label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#A78BFA' }}>Process</p>
          <h2 className="text-4xl font-black text-white">Three Steps to Certainty</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: '01', emoji: '💡', title: 'Drop your idea', body: 'Type any content topic — blog, YouTube video, podcast, or social post.' },
            { n: '02', emoji: '🔬', title: 'We scan everything', body: 'Live YouTube search, Google Trends, Wikipedia traffic, and AI analysis — all in under 30 seconds.' },
            { n: '03', emoji: '🚀', title: 'Get your edge', body: 'Receive scores, an AI report, and enhanced idea variants that outcompete the current landscape.' },
          ].map(({ n, emoji, title, body }, idx) => (
            <div key={n} className="relative text-center">
              {idx < 2 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%-12px)] w-full"
                  style={{ height: 1, background: 'linear-gradient(90deg, rgba(139,92,246,.35), transparent)', zIndex: 10 }} />
              )}
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)' }}>
                {emoji}
              </div>
              <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#A78BFA' }}>{n}</div>
              <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#A78BFA' }}>Capabilities</p>
          <h2 className="text-4xl font-black text-white mb-3">Everything in one report</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Every analysis gives you the full picture — from raw data to polished AI narrative to better content angles.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="card" style={{ transition: 'border-color .2s, transform .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,.05)' }}>
                {icon}
              </div>
              <h3 className="text-white font-bold text-base mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)' }} className="py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}>
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-sm gradient-text">IdeaValidator</span>
        </div>
        <p className="text-gray-600 text-xs">© {new Date().getFullYear()} IdeaValidator. Built for content creators.</p>
      </footer>
    </div>
  );
};

export default HomePage;
