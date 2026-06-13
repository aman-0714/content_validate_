import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LayoutDashboard, LogOut, Menu, X, History, Plus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-150 ${
        isActive(to)
          ? 'text-white bg-white/[0.07] border border-white/10'
          : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
      }`}
    >
      {Icon && <Icon size={15} />}
      {children}
    </Link>
  );

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(11,15,26,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-shadow duration-200 group-hover:shadow-cyan-sm"
              style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #0087A3 100%)' }}
            >
              <Zap size={15} className="text-navy-950" style={{ color: '#060810' }} />
            </div>
            <span className="font-bold text-base gradient-text tracking-tight">IdeaValidator</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink to="/history"   icon={History}>History</NavLink>

                <div className="w-px h-5 bg-white/[0.08] mx-2" />

                <Link
                  to="/analyzer"
                  className="btn-primary py-1.5 px-4 text-xs"
                  style={{ fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> New Analysis
                </Link>

                <div className="w-px h-5 bg-white/[0.08] mx-2" />

                {/* Avatar */}
                <Link to="/profile" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors group">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #0087A3)', color: '#060810' }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="ml-1 text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"  className="text-slate-400 hover:text-white text-sm px-4 py-2 transition-colors">Login</Link>
                <Link to="/signup" className="btn-primary py-1.5 px-4 text-xs" style={{ fontSize: '0.8rem' }}>Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-4 py-3 space-y-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0B0F1A' }}
        >
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/[0.05] text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/history" className="flex items-center gap-2 text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/[0.05] text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <History size={15} /> History
              </Link>
              <Link to="/analyzer" className="flex items-center gap-2 text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/[0.05] text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <Plus size={15} /> New Analysis
              </Link>
              <div className="divider my-2" />
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 py-2 px-3 rounded-lg hover:bg-red-500/10 text-sm transition-colors w-full">
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="block text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/[0.05] text-sm transition-colors" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="block text-cyan-400 hover:text-cyan-300 py-2 px-3 rounded-lg hover:bg-cyan-500/10 text-sm font-semibold transition-colors" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
