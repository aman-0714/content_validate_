import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LayoutDashboard, LogOut, Menu, X, History, Plus, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const active = (p) => location.pathname === p;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-150
        ${active(to)
          ? 'text-white bg-white/[0.07] border border-white/[0.08]'
          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'}`}
    >
      {Icon && <Icon size={14} />}
      {children}
    </Link>
  );

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(9,9,11,.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,.06)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(139,92,246,.35)',
              transition: 'box-shadow .2s',
            }} className="group-hover:shadow-[0_2px_20px_rgba(139,92,246,.55)]">
              <Zap size={14} color="#fff" />
            </div>
            <span style={{
              fontWeight: 700, fontSize: '.95rem', letterSpacing: '-.02em',
              background: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>IdeaValidator</span>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '.05em',
              background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)',
              color: '#A78BFA', padding: '1px 7px', borderRadius: 99,
            }}>AI</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink to="/history"   icon={History}>History</NavLink>

                <div style={{ width:1, height:20, background:'rgba(255,255,255,.07)', margin:'0 8px' }} />

                <Link to="/analyzer" className="btn-primary" style={{ padding:'.45rem 1rem', fontSize:'.8rem', gap:'.3rem' }}>
                  <Plus size={13} /> New Analysis
                </Link>

                <div style={{ width:1, height:20, background:'rgba(255,255,255,.07)', margin:'0 8px' }} />

                <Link to="/profile" style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 8px', borderRadius:10, transition:'background .15s', textDecoration:'none' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700, color:'#fff',
                  }}>{user.name?.charAt(0).toUpperCase()}</div>
                  <span style={{ fontSize:13, color:'#A1A1AA', fontWeight:500 }}>{user.name}</span>
                </Link>

                <button onClick={handleLogout} className="btn-ghost" style={{ padding:'6px 8px', color:'#52525B' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#F87171'}
                  onMouseLeave={e=>e.currentTarget.style.color='#52525B'}
                  title="Sign out">
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"  className="btn-ghost">Login</Link>
                <Link to="/signup" className="btn-primary" style={{ padding:'.45rem 1rem', fontSize:'.8rem' }}>Get Started <Sparkles size={12} /></Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden btn-ghost p-2" onClick={() => setOpen(o => !o)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', background:'#09090B', padding:'12px 16px' }} className="md:hidden space-y-1">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost w-full justify-start" onClick={()=>setOpen(false)}><LayoutDashboard size={14}/>Dashboard</Link>
              <Link to="/history"   className="btn-ghost w-full justify-start" onClick={()=>setOpen(false)}><History size={14}/>History</Link>
              <Link to="/analyzer"  className="btn-ghost w-full justify-start" onClick={()=>setOpen(false)}><Plus size={14}/>New Analysis</Link>
              <div className="divider my-2" />
              <button onClick={handleLogout} className="btn-ghost w-full justify-start text-red-400 hover:text-red-300">
                <LogOut size={14}/>Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn-ghost w-full justify-start" onClick={()=>setOpen(false)}>Login</Link>
              <Link to="/signup" className="btn-primary w-full" onClick={()=>setOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
