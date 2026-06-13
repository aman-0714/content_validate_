import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Mail, LogOut, Shield, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090B' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <User className="text-violet-400" /> Profile
        </h1>

        {/* Avatar & Name */}
        <div className="card mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-400 flex items-center gap-1 mt-1">
                <Mail size={14} /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="card mb-6 space-y-4">
          <h3 className="text-white font-semibold mb-2">Account Details</h3>
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
              <User size={16} /> Full Name
            </div>
            <span className="text-white font-medium">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
              <Mail size={16} /> Email
            </div>
            <span className="text-white font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield size={16} /> Account ID
            </div>
            <button onClick={handleCopyId} className="text-gray-500 hover:text-violet-400 text-xs font-mono transition-colors">
              {copied ? '✅ Copied!' : `${user?.id?.slice(0, 8)}...`}
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={16} /> Plan
            </div>
            <span className="bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs font-semibold px-3 py-1 rounded-full">
              Free Plan
            </span>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="card mb-6">
          <h3 className="text-white font-semibold mb-3">🛠️ Project Tech Stack</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ['Frontend', 'React.js + Tailwind CSS'],
              ['Backend', 'Node.js + Express.js'],
              ['Database', 'MongoDB + Mongoose'],
              ['Auth', 'JWT Authentication'],
              ['AI', 'Google Gemini API'],
              ['Data', 'YouTube + Reddit APIs'],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col bg-gray-800/50 rounded-lg px-3 py-2">
                <span className="text-gray-500 text-xs">{label}</span>
                <span className="text-white text-xs font-medium mt-0.5">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-semibold transition-all"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
