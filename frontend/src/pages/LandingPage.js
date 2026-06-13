import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  Zap, BarChart3, Brain, Target, ArrowRight,
  Youtube, TrendingUp, Star, Sparkles, Shield, Clock
} from 'lucide-react';

const FEATURES = [
  { icon: <BarChart3 size={20} className="text-violet-400" />, title: '4-Metric Scoring', desc: 'Competition, Demand, Originality, and Viral Potential scores calculated from real live data.' },
  { icon: <Youtube size={20} className="text-red-400" />, title: 'YouTube Intelligence', desc: 'Surface top competing videos with view counts, likes, and engagement metrics.' },
  { icon: <TrendingUp size={20} className="text-blue-400" />, title: 'Trend Mapping', desc: 'Google Trends and Wikipedia traffic reveal whether interest is rising or cooling.' },
  { icon: <Brain size={20} className="text-emerald-400" />, title: 'Full AI Report', desc: 'Groq AI generates a structured analysis with actionable recommendations and next steps.' },
  { icon: <Sparkles size={20} className="text-yellow-400" />, title: 'Idea Enhancement', desc: 'Get 5 AI-refined content angles that outcompete the current landscape.' },
  { icon: <Target size={20} className="text-pink-400" />, title: 'Save & Compare', desc: 'Every report lives in your dashboard. Track and compare ideas over time.' },
];

const LandingPage = () => {
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
          position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'rgba(99,102,241,0.07)', filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', color: '#A78BFA' }}>
            <Zap size={12} /> AI-Powered Content Intelligence
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.08] tracking-tight">
            Validate Your{' '}
            <span className="gradient-text">Content Ideas</span>
            <br />Before You Create
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop wasting hours on content that won't perform. Get AI-powered analysis of competition,
            demand, originality, and viral potential — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to={user ? '/analyzer' : '/signup'} className="btn-primary"
              style={{ fontSize: '1rem', padding: '.85rem 2rem' }}>
              Start Analyzing Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary"
              style={{ fontSize: '1rem', padding: '.85rem 2rem' }}>
              Sign In
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
              <span className="ml-2">Loved by creators</span>
            </div>
            <span className="hidden sm:block w-px h-4 bg-gray-700" />
            <span className="flex items-center gap-1.5"><Shield size={13} className="text-emerald-400" /> No credit card needed</span>
            <span className="hidden sm:block w-px h-4 bg-gray-700" />
            <span className="flex items-center gap-1.5"><Clock size={13} className="text-blue-400" /> Under 30 seconds</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#A78BFA' }}>Process</p>
          <h2 className="text-4xl font-black text-white">Three Steps to Certainty</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: '01', emoji: '💡', title: 'Enter Your Idea', body: 'Type any content topic — blog post, YouTube video, social post, or podcast idea.' },
            { n: '02', emoji: '🔬', title: 'We Analyze Everything', body: 'Live YouTube search, Google Trends, Wikipedia traffic, and AI analysis — all in under 30 seconds.' },
            { n: '03', emoji: '📊', title: 'Get Your Report', body: 'Receive scores, an AI report, and enhanced idea variants that outcompete the current landscape.' },
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
      <section className="max-w-6xl mx-auto px-6 pb-28">
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

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="card-brand" style={{ padding: '3.5rem 2rem' }}>
          <Sparkles size={32} className="text-violet-400 mx-auto mb-5" />
          <h2 className="text-4xl font-black text-white mb-4">Ready to validate your next idea?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join creators who make data-driven content decisions. Free to start, no card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? '/analyzer' : '/signup'} className="btn-primary"
              style={{ fontSize: '1rem', padding: '.85rem 2.5rem' }}>
              {user ? 'Go to Analyzer' : 'Create Free Account'} <ArrowRight size={18} />
            </Link>
            {!user && (
              <Link to="/login" className="btn-secondary"
                style={{ fontSize: '1rem', padding: '.85rem 2.5rem' }}>
                Sign in
              </Link>
            )}
          </div>
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

export default LandingPage;
