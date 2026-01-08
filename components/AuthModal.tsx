
import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, Github, Chrome, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authService } from '../authService';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthStatus(isLogin ? 'Authenticating with Firebase...' : 'Creating Firebase Account...');
    try {
      const user = isLogin 
        ? await authService.login(email, password)
        : await authService.signUp(email, password);
        
      setAuthStatus('Authentication successful!');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Authentication failed. Check your credentials.");
      setAuthStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setAuthStatus(`Connecting to ${provider === 'google' ? 'Google' : 'GitHub'} Gateway...`);
    try {
      const user = await authService.loginWithProvider(provider);
      setAuthStatus('Handshake successful. Fetching secure profile...');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(err);
      alert(err.message || `Social login with ${provider} failed. Note: Social providers must be enabled in the Firebase Console.`);
      setAuthStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        {/* Loading/Status Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
            <div className="relative mb-6">
              <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
              {authStatus?.includes('successful') && (
                <CheckCircle2 className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in" />
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              Secure Gateway
            </h3>
            <p className="text-slate-500 font-bold text-sm">{authStatus}</p>
          </div>
        )}

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10">
          <div className="text-center mb-10">
            <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">
              {isLogin ? 'Welcome Back' : 'Join the Quest'}
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Securely access your Maharashtra travel dashboard.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-rose-200 transition-all font-bold text-slate-700 group shadow-sm active:scale-[0.98]"
            >
              <Chrome className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
              Continue with Google
            </button>
            <button 
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-900 transition-all font-bold text-slate-700 group shadow-sm active:scale-[0.98]"
            >
              <Github className="w-5 h-5 text-slate-900 group-hover:scale-110 transition-transform" />
              Continue with GitHub
            </button>
          </div>

          <div className="mb-8 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-400">
              <span className="bg-white px-4">OR USE EMAIL</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none font-bold text-slate-900 bg-slate-50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none font-bold text-slate-900 bg-slate-50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 active:scale-95"
            >
              {isLogin ? 'Login to Explore' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
            Firebase Secure Authentication
          </div>

          <p className="text-center mt-10 text-sm font-bold text-slate-500">
            {isLogin ? "New to the Sahyadris?" : "Already a member?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
