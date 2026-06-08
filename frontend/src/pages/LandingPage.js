import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, BarChart3, Brain, Target, ArrowRight, Youtube, MessageCircle, TrendingUp, Star } from 'lucide-react';
import Navbar from '../components/Navbar';

const FeatureCard = ({ icon, title, desc }) => (
  <div className="card hover:border-violet-500/50 transition-all duration-300 group">
    <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
      {icon}
    </div>
    <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-gray-950 to-indigo-950/30 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm px-4 py-2 rounded-full mb-8">
            <Zap size={14} /> AI-Powered Content Intelligence
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Validate Your{' '}
            <span className="gradient-text">Content Ideas</span>
            <br />Before You Create
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop wasting hours on content that won't perform. Get AI-powered analysis of competition, demand, originality, and viral potential — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary text-lg py-4 px-8 inline-flex items-center gap-2 glow">
              Start Analyzing Free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn-secondary text-lg py-4 px-8">
              Sign In
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="ml-2">Loved by creators</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <span>YouTube + Reddit + AI</span>
            <div className="w-px h-4 bg-gray-700" />
            <span>Free to start</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Three steps to validate any content idea</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Enter Your Idea', desc: 'Type any content topic — blog post, YouTube video, social post, or podcast idea.', icon: '💡' },
            { step: '02', title: 'We Analyze Everything', desc: 'We search YouTube, Reddit, and use AI to score competition, demand, and originality.', icon: '🔍' },
            { step: '03', title: 'Get Your Report', desc: 'Receive a full report with scores, AI recommendations, and better angle suggestions.', icon: '📊' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <div className="text-violet-500 font-bold text-sm mb-2">{item.step}</div>
              <h3 className="text-white text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-gray-400 text-lg">Comprehensive content intelligence in one platform</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={<BarChart3 className="text-violet-400" />} title="4-Metric Scoring" desc="Competition, Demand, Originality, and Viral Potential scores calculated from real data." />
          <FeatureCard icon={<Youtube className="text-red-400" />} title="YouTube Analysis" desc="See top 10 competing videos with view counts, likes, and engagement metrics." />
          <FeatureCard icon={<MessageCircle className="text-blue-400" />} title="Reddit Insights" desc="Discover community discussions, upvotes, and interest level across subreddits." />
          <FeatureCard icon={<Brain className="text-emerald-400" />} title="AI Report by Gemini" desc="Google Gemini generates a full analysis with actionable recommendations." />
          <FeatureCard icon={<TrendingUp className="text-yellow-400" />} title="Better Angle Generator" desc="Get 5 improved content angles to stand out from the competition." />
          <FeatureCard icon={<Target className="text-pink-400" />} title="Save & Compare" desc="Save all reports to your dashboard and track your content strategy over time." />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="card bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border-violet-500/30">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Validate Your Next Idea?</h2>
          <p className="text-gray-300 text-lg mb-8">Join creators who make data-driven content decisions.</p>
          <Link to="/signup" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>© 2024 IdeaValidator. Built with ❤️ for content creators.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
