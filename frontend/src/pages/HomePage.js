import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, ArrowRight, BarChart3, Brain, TrendingUp, Target,
  Youtube, Lightbulb, CheckCircle, Star, ChevronRight,
  Sparkles, Shield, Clock
} from 'lucide-react';

/* ─── Inline styles that extend the existing Tailwind theme ─── */
const styles = {
  heroGlow: {
    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.25) 0%, transparent 70%)',
  },
  goldAccent: { color: '#c9a84c' },
  goldBorder: { borderColor: '#c9a84c40' },
  goldBg: { background: 'linear-gradient(135deg, #c9a84c22, #c9a84c08)' },
  glassBg: {
    background: 'rgba(15,15,20,0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  heroBg: {
    background: 'linear-gradient(135deg, #0d0d14 0%, #0f0a1a 40%, #0d0d14 100%)',
  },
  marqueeTrack: {
    display: 'flex',
    animation: 'marquee 28s linear infinite',
    gap: '2rem',
    whiteSpace: 'nowrap',
  },
};

const METRICS = [
  { value: '4', label: 'Scoring Dimensions', icon: <BarChart3 size={22} style={styles.goldAccent} /> },
  { value: '10+', label: 'YouTube Signals', icon: <Youtube size={22} className="text-red-400" /> },
  { value: '<30s', label: 'Analysis Time', icon: <Clock size={22} className="text-blue-400" /> },
  { value: 'AI', label: 'Powered by Groq', icon: <Brain size={22} className="text-violet-400" /> },
];

const FEATURES = [
  {
    icon: <BarChart3 size={24} style={styles.goldAccent} />,
    title: 'Precision Scoring',
    desc: 'Four-axis scoring — Competition, Demand, Originality, and Viral Potential — calculated from live data, not guesses.',
  },
  {
    icon: <Lightbulb size={24} className="text-yellow-400" />,
    title: 'Idea Enhancement',
    desc: 'Our AI refines your raw concept into sharpened angles that keep your intent but dramatically lift search and click appeal.',
  },
  {
    icon: <Youtube size={24} className="text-red-400" />,
    title: 'YouTube Intelligence',
    desc: 'Surface the top 10 competing videos with views, likes, and channel data so you know exactly who you\'re up against.',
  },
  {
    icon: <TrendingUp size={24} className="text-emerald-400" />,
    title: 'Trend Mapping',
    desc: 'Google Trends and Wikipedia pageviews reveal whether public interest is rising, peaking, or cooling — before you invest time.',
  },
  {
    icon: <Brain size={24} className="text-violet-400" />,
    title: 'Full AI Report',
    desc: 'Groq\'s LLaMA model writes a structured analysis: competition landscape, audience interest, originality, and next steps.',
  },
  {
    icon: <Target size={24} className="text-pink-400" />,
    title: 'History & Compare',
    desc: 'Every report lives in your dashboard. Track how your content strategy evolves and compare ideas side by side.',
  },
];

const TESTIMONIALS = [
  { quote: 'Saved me from making three videos nobody would have watched. The competition score is scarily accurate.', author: 'Priya S.', role: 'Tech YouTuber' },
  { quote: 'The idea enhancement alone is worth it. My angles went from generic to genuinely differentiated.', author: 'Marcus T.', role: 'Content Strategist' },
  { quote: 'I validate every blog post before writing now. Hit top 3 on Google twice this month.', author: 'Aarav M.', role: 'SaaS Blogger' },
];

const TICKER_ITEMS = [
  'YouTube Analysis', 'Viral Score', 'Google Trends', 'Idea Enhancement',
  'AI Report', 'Competition Scan', 'Demand Signals', 'Better Angles',
];

/* ─── Navbar ─── */
const HomeNavbar = () => {
  const { user } = useAuth();
  return (
    <nav style={{ ...styles.glassBg, borderBottom: '1px solid rgba(201,168,76,0.12)' }}
      className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #8b5cf6)' }}>
            <Zap size={17} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span style={styles.goldAccent}>Idea</span>
            <span className="text-white">Validator</span>
          </span>
        </Link>

        {/* Centre links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it works', href: '#how-it-works' },
          ].map(({ label, href }) => (
            <a key={label} href={href}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #b8962a)' }}>
              Dashboard <ChevronRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login"
                className="hidden sm:block px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link to="/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #e0b85a)' }}>
                Get Started <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

/* ─── Main ─── */
const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={styles.heroBg}>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes floatUp {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes shimmer {
          0%,100% { opacity:0.6; }
          50% { opacity:1; }
        }
        .gold-btn {
          background: linear-gradient(135deg, #c9a84c, #e0b85a);
          color: #0d0d14;
          font-weight: 700;
          border-radius: 12px;
          transition: all .2s;
        }
        .gold-btn:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(201,168,76,.35); }
        .ghost-btn {
          border: 1px solid rgba(201,168,76,.35);
          color: #c9a84c;
          font-weight: 600;
          border-radius: 12px;
          transition: all .2s;
          background: transparent;
        }
        .ghost-btn:hover { background: rgba(201,168,76,.08); transform: translateY(-1px); }
        .feature-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 18px;
          transition: all .25s;
        }
        .feature-card:hover {
          background: rgba(201,168,76,.06);
          border-color: rgba(201,168,76,.22);
          transform: translateY(-3px);
        }
        .metric-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px;
        }
        .testimonial-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
        }
        .step-line::after {
          content:'';
          display:block;
          position:absolute;
          top:32px; left:calc(50% + 24px);
          width: calc(100% - 48px);
          height:1px;
          background: linear-gradient(90deg, rgba(201,168,76,.4), rgba(201,168,76,.05));
        }
      `}</style>

      <HomeNavbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-32 text-center px-6">
        <div style={styles.heroGlow} className="absolute inset-0 pointer-events-none" />

        {/* Floating orbs */}
        <div className="absolute top-32 left-12 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(139,92,246,.07)', filter: 'blur(72px)', animation: 'floatUp 8s ease-in-out infinite' }} />
        <div className="absolute top-16 right-12 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'rgba(201,168,76,.06)', filter: 'blur(60px)', animation: 'floatUp 10s ease-in-out infinite reverse' }} />

        <div className="relative max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8"
            style={{ border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', background: 'rgba(201,168,76,.07)' }}>
            <Sparkles size={12} /> AI Content Intelligence
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.08] tracking-tight">
            Know Before
            <br />
            <span style={{ background: 'linear-gradient(90deg, #c9a84c, #e8c96a, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              You Create
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing. IdeaValidator scores every content idea against real YouTube data, Google Trends,
            and AI analysis — and then rewrites it to perform better.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to={user ? '/analyzer' : '/signup'}
              className="gold-btn inline-flex items-center gap-2 px-8 py-4 text-base">
              {user ? 'Analyze an Idea' : 'Start for Free'} <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="ghost-btn inline-flex items-center gap-2 px-8 py-4 text-base">
              See how it works
            </a>
          </div>

          {/* Social proof row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} style={styles.goldAccent} fill="#c9a84c" />
              ))}
              <span className="ml-2">Loved by creators</span>
            </div>
            <span className="w-px h-4 bg-gray-700 hidden sm:block" />
            <span className="flex items-center gap-1.5"><Shield size={13} className="text-emerald-400" /> No credit card needed</span>
            <span className="w-px h-4 bg-gray-700 hidden sm:block" />
            <span>YouTube + Google Trends + Groq AI</span>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="overflow-hidden py-5" style={{ borderTop: '1px solid rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.015)' }}>
        <div style={styles.marqueeTrack}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-xs font-semibold tracking-widest uppercase flex items-center gap-3"
              style={{ color: i % 2 === 0 ? '#c9a84c' : '#6b7280' }}>
              {item} <span style={{ color: 'rgba(201,168,76,.3)' }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── METRICS ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map(({ value, label, icon }) => (
          <div key={label} className="metric-card p-6 text-center">
            <div className="flex justify-center mb-3">{icon}</div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-gray-500 text-xs font-medium">{label}</div>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={styles.goldAccent}>Process</p>
          <h2 className="text-4xl font-black text-white">Three Steps to Certainty</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: '01', emoji: '💡', title: 'Drop your idea', body: 'Type any content topic — blog, YouTube video, podcast, or social post.' },
            { n: '02', emoji: '🔬', title: 'We scan everything', body: 'Live YouTube search, Google Trends, Wikipedia traffic, and AI analysis — all in under 30 seconds.' },
            { n: '03', emoji: '🚀', title: 'Get your edge', body: 'Receive scores, an AI report, and enhanced idea variants that outcompete the current landscape.' },
          ].map(({ n, emoji, title, body }, idx) => (
            <div key={n} className="relative">
              {idx < 2 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%-12px)] w-full z-10"
                  style={{ height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,.35), transparent)' }} />
              )}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)' }}>
                  {emoji}
                </div>
                <div className="text-xs font-bold tracking-widest uppercase mb-2" style={styles.goldAccent}>{n}</div>
                <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={styles.goldAccent}>Capabilities</p>
          <h2 className="text-4xl font-black text-white mb-3">Everything in one report</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Every analysis gives you the full picture — from raw data to polished AI narrative to better content angles.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card p-6">
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

      {/* ── IDEA ENHANCER CALLOUT ── */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <div className="rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,.15), rgba(201,168,76,.08))', border: '1px solid rgba(201,168,76,.2)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'rgba(139,92,246,.08)', filter: 'blur(60px)', transform: 'translate(30%,-30%)' }} />
          <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c9a84c22, #8b5cf622)', border: '1px solid rgba(201,168,76,.3)' }}>
              <Sparkles size={28} style={styles.goldAccent} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-white mb-2">New: Idea Enhancement</h3>
              <p className="text-gray-400 leading-relaxed">
                Before running the full analysis, hit <strong className="text-white">Enhance Idea</strong> on the analyzer page.
                The AI sharpens your concept into five scored variants — same intent, dramatically higher potential.
              </p>
            </div>
            <Link to={user ? '/analyzer' : '/signup'}
              className="gold-btn inline-flex items-center gap-2 px-6 py-3 text-sm flex-shrink-0">
              Try it <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={styles.goldAccent}>Social Proof</p>
          <h2 className="text-4xl font-black text-white">Creators who stopped guessing</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, author, role }) => (
            <div key={author} className="testimonial-card p-7">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} style={styles.goldAccent} fill="#c9a84c" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">"{quote}"</p>
              <div>
                <p className="text-white font-semibold text-sm">{author}</p>
                <p className="text-gray-500 text-xs mt-0.5">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="max-w-3xl mx-auto px-6 pb-32 text-center">
        <div className="rounded-2xl p-14"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,.08), rgba(139,92,246,.08))', border: '1px solid rgba(201,168,76,.18)' }}>
          <CheckCircle size={36} style={styles.goldAccent} className="mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">Ready to validate your next idea?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join creators who make data-driven content decisions. Free to start, no card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? '/analyzer' : '/signup'}
              className="gold-btn inline-flex items-center justify-center gap-2 px-8 py-4 text-base">
              {user ? 'Go to Analyzer' : 'Create Free Account'} <ArrowRight size={18} />
            </Link>
            {!user && (
              <Link to="/login" className="ghost-btn inline-flex items-center justify-center gap-2 px-8 py-4 text-base">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)' }} className="py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#8b5cf6)' }}>
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-sm" style={styles.goldAccent}>IdeaValidator</span>
        </div>
        <p className="text-gray-600 text-xs">© {new Date().getFullYear()} IdeaValidator. Built for content creators.</p>
      </footer>
    </div>
  );
};

export default HomePage;
