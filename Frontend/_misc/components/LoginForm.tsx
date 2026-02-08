
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Logo from './Logo';

interface LoginFormProps {
  onAuthSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: 'user', 
              points: 0,
              wallet_balance: 0,
              is_blocked: false,
              referral_code: Math.random().toString(36).substring(2, 8).toUpperCase()
            }
          ]);
          if (profileError) throw profileError;
        }
        
        alert('অ্যাকাউন্ট তৈরি হয়েছে! এখন লগইন করুন।');
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="bg-[#0f172a]/80 backdrop-blur-3xl w-full max-w-lg p-10 md:p-14 rounded-[4rem] border border-white/5 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-12">
          <Logo size="lg" className="mx-auto mb-6 rotate-3 hover:rotate-0" />
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Zenumama <span className="text-indigo-500">Reward</span></h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Neural Earn & Payout Protocol</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Full Name</label>
              <input 
                type="text"
                required
                placeholder="Enter your name"
                className="w-full p-5 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white font-bold"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Email Address</label>
            <input 
              type="email"
              required
              className="w-full p-5 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white font-bold"
              placeholder="neural@zenumama.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Access Key (Password)</label>
            <input 
              type="password"
              required
              className="w-full p-5 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all text-xs disabled:bg-slate-800 disabled:text-slate-500 mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Initializing...
              </div>
            ) : (isLogin ? 'Establish Connection' : 'Register Protocol')}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-400 transition-all"
          >
            {isLogin ? "Don't have an account? Create Neural Link" : "Existing Link Found? Synchronize Profile"}
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-2">
           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
           <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Secured by AES-256 Quantum Shield</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
