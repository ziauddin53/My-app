
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface WalletProps {
  profile: UserProfile | null;
  onConvert: (points: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ profile, onConvert }) => {
  const [isConverting, setIsConverting] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState(1000);

  if (!profile) return null;

  const handleConvert = () => {
    if (pointsToConvert > profile.points) {
      alert("আপনার পর্যাপ্ত পয়েন্ট নেই!");
      return;
    }
    if (pointsToConvert < 1000) {
      alert("ন্যূনতম ১০০০ পয়েন্ট কনভার্ট করা যাবে।");
      return;
    }
    onConvert(pointsToConvert);
    setIsConverting(false);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 mb-8 border border-white/10 group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Current Balance</p>
            <h2 className="text-5xl font-black tracking-tighter flex items-center">
              <span className="text-indigo-200 mr-2">৳</span>
              {profile.wallet_balance.toFixed(2)}
            </h2>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
            <span className="text-3xl">💎</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-0.5">Reward Points</p>
            <p className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              {profile.points.toLocaleString()} <span className="text-xs font-medium text-white/60">pts</span>
            </p>
          </div>

          <button 
            onClick={() => setIsConverting(true)}
            className="bg-white text-indigo-700 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-50 active:scale-95 transition-all duration-300"
          >
            পয়েন্ট কনভার্ট
          </button>
        </div>
      </div>

      {isConverting && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-slate-900 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black mb-2">পয়েন্ট এক্সচেঞ্জ</h3>
            <p className="text-slate-500 text-xs font-bold mb-8">১০০০ পয়েন্ট = ১০ টাকা</p>
            
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">কত পয়েন্ট কনভার্ট করবেন?</label>
                <input 
                  type="number" 
                  step="1000"
                  value={pointsToConvert}
                  onChange={(e) => setPointsToConvert(Number(e.target.value))}
                  className="w-full bg-transparent text-3xl font-black outline-none text-indigo-600"
                />
              </div>
              <div className="flex justify-between text-xs font-bold px-2">
                <span className="text-slate-400 uppercase">You will get:</span>
                <span className="text-emerald-600">৳{(pointsToConvert / 100).toFixed(2)}</span>
              </div>
              <button 
                onClick={handleConvert}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl"
              >
                কনফার্ম করুন
              </button>
              <button onClick={() => setIsConverting(false)} className="w-full text-slate-400 font-bold text-sm">বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
