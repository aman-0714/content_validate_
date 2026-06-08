import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">IdeaValidator</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to="/analyzer" className="btn-primary py-2 px-4 text-sm">
                  + New Analysis
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
                  <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-800">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors px-4 py-2">Login</Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-2">
          {user ? (
            <>
              <Link to="/dashboard" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/analyzer" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>New Analysis</Link>
              <Link to="/profile" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block text-red-400 py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="block text-violet-400 hover:text-violet-300 py-2 font-semibold" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
