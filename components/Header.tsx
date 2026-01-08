
import React, { useState, useRef, useEffect } from 'react';
import { Map, Github, User as UserIcon, LogOut, Heart, Bookmark, ChevronDown, Compass } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onOpenSaved: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout, onOpenSaved }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-950 text-white sticky top-0 z-40 shadow-xl border-b border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-900/20 group cursor-pointer hover:rotate-12 transition-transform">
            <Map className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">
            EXPLORE<span className="text-emerald-500">MH</span>
          </span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-10">
          <button onClick={onOpenSaved} className="text-sm font-black uppercase tracking-widest text-slate-300 hover:text-emerald-400 transition-colors">My Trips</button>
          <a href="#" className="text-sm font-black uppercase tracking-widest text-slate-300 hover:text-emerald-400 transition-colors">Destinations</a>
          <a href="#" className="text-sm font-black uppercase tracking-widest text-slate-300 hover:text-emerald-400 transition-colors">Culture</a>
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <button 
              onClick={onLoginClick}
              className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
            >
              <UserIcon className="w-4 h-4" />
              Sign In
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-1.5 pr-4 rounded-full transition-all border border-white/10 group"
              >
                <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full border-2 border-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">{user.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden text-slate-950 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authenticated</p>
                    <p className="text-sm font-black text-slate-900">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { onOpenSaved(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-slate-700 font-bold text-sm rounded-2xl transition-colors">
                      <Bookmark className="w-4 h-4 text-emerald-600" /> My Saved Trips
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-slate-700 font-bold text-sm rounded-2xl transition-colors">
                      <Heart className="w-4 h-4 text-rose-500" /> Favorites
                    </button>
                    <div className="h-px bg-slate-100 my-2 mx-4"></div>
                    <button 
                      onClick={() => { onLogout(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 text-rose-600 font-bold text-sm rounded-2xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
