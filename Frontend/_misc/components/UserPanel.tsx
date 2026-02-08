
import React, { useState, useEffect } from 'react';
import Wallet from './Wallet';
import TaskList from './TaskList';
import CashoutButton from './CashoutButton';
import Leaderboard from './Leaderboard';
import History from './History';
import { UserProfile, Task, Transaction, SystemSettings } from '../types';
import { supabase } from '../supabaseClient';
import Logo from './Logo';

interface UserPanelProps {
  profile: UserProfile | null;
  tasks: Task[];
  transactions: Transaction[];
  systemSettings: SystemSettings;
  onTaskClick: (task: Task) => void;
  onSignOut: () => void;
  onRefresh: () => void;
  onDailyCheckIn: () => void;
  onConvert: (points: number) => void;
  onAutoCashout: (amount: number, method: 'bkash' | 'nagad' | 'recharge' | 'giftcard', account: string, operator?: string) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ 
  profile, tasks, transactions, systemSettings, onTaskClick, onSignOut, onRefresh, onDailyCheckIn, onConvert, onAutoCashout
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'history' | 'profile'>('home');
  const [rank, setRank] = useState<number | string>('...');

  useEffect(() => {
    if (profile) calculateRank();
  }, [profile]);

  const calculateRank = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('points', profile?.points || 0);
    
    setRank((count || 0) + 1);
  };

  const canCheckIn = () => {
    if (!profile?.last_check_in) return true;
    const last = new Date(profile.last_check_in).toDateString();
    const now = new Date().toDateString();
    return last !== now;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Global Notice Banner */}
            {systemSettings.app_notice && (
              <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-[2rem] flex items-start gap-4">
                 <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg">📢</div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">নোটিশ বোর্ড</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{systemSettings.app_notice}</p>
                 </div>
              </div>
            )}

            <Wallet profile={profile} onConvert={onConvert} />
            
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
               <h4 className="font-black text-lg mb-1 flex items-center gap-2">
                 <span>🎁</span> ডেইলি বোনাস
               </h4>
               <p className="text-emerald-50 text-[10px] font-bold uppercase tracking-wider mb-4">প্রতিদিন অ্যাপ ওপেন করে ৫০ পয়েন্ট নিন</p>
               <button 
                 onClick={onDailyCheckIn}
                 disabled={!canCheckIn()}
                 className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${canCheckIn() ? 'bg-white text-emerald-600 shadow-lg hover:scale-[1.02]' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}
               >
                 {canCheckIn() ? 'Claim Bonus Now' : 'Come Back Tomorrow'}
               </button>
            </div>

            <Leaderboard />
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col space-y-2 mb-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">সব অফার</h2>
              <p className="text-slate-400 text-xs font-medium">কাজ সম্পন্ন করুন এবং আনলিমিটেড পয়েন্ট আয় করুন</p>
            </div>
            <TaskList tasks={tasks} onTaskClick={onTaskClick} />
            <CashoutButton 
              balance={profile?.wallet_balance || 0} 
              userId={profile?.id || ''} 
              systemSettings={systemSettings}
              onSuccess={(amount, method, account, operator) => {
                onAutoCashout(amount, method, account, operator);
                onRefresh();
              }} 
            />
          </div>
        );
      case 'history':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col space-y-2 mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">অ্যাক্টিভিটি</h2>
              <p className="text-slate-400 text-xs font-medium">আপনার সব লেনদেনের রেকর্ড এখানে পাবেন</p>
            </div>
            <History transactions={transactions} />
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
              <div className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">👤</div>
              <h3 className="text-2xl font-black text-slate-900">{profile?.full_name || 'Reward User'}</h3>
              <p className="text-slate-400 text-sm font-medium">{profile?.email}</p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Earned</p>
                   <p className="font-black text-indigo-600">৳{((profile?.points || 0) / 100 + (profile?.wallet_balance || 0)).toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Rank</p>
                   <p className="font-black text-emerald-600">#{rank}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="font-black mb-1">🤝 বন্ধুকে ইনভাইট করুন</h4>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-6">আপনার রেফার কোড ব্যবহার করে বোনাস পান</p>
                 <div className="flex items-center bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                    <code className="flex-1 font-mono text-indigo-400 font-black text-lg">{profile?.referral_code || '---'}</code>
                    <button onClick={() => { navigator.clipboard.writeText(profile?.referral_code || ''); alert('Code Copied!'); }} className="text-[10px] font-black uppercase text-white bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-500 transition-all">Copy</button>
                 </div>
               </div>
            </div>

            {/* Support Section */}
            <div className="grid grid-cols-1 gap-4">
              <a 
                href={systemSettings.support_link} 
                target="_blank" 
                rel="noreferrer"
                className="bg-indigo-600 text-white p-6 rounded-[2rem] font-black text-center text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
              >
                <span>💬</span> Contact Support Center
              </a>
            </div>

            <button 
              onClick={onSignOut}
              className="w-full py-5 rounded-[2rem] border-2 border-red-50 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all"
            >
              Log Out From Device
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-36 min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Logo size="sm" className="rotate-3 group-hover:rotate-0" />
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">Zenumama <span className="text-indigo-600">Reward</span></h1>
            <div className="flex items-center text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
              Live Online
            </div>
          </div>
        </div>
        <button onClick={onRefresh} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
          🔄
        </button>
      </header>

      <main className="px-6 py-8">
        {renderContent()}
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <nav className="bg-slate-900/95 backdrop-blur-2xl p-3 rounded-[3rem] flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 ring-1 ring-white/5">
          <button onClick={() => setActiveTab('home')} className={`relative flex flex-col items-center py-3 px-6 rounded-[2rem] transition-all duration-300 ${activeTab === 'home' ? 'text-indigo-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
            <span className={`text-2xl transition-transform duration-300 ${activeTab === 'home' ? 'scale-110 -translate-y-1' : ''}`}>🏠</span>
            <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Home</span>
          </button>
          <button onClick={() => setActiveTab('tasks')} className={`relative flex flex-col items-center py-3 px-6 rounded-[2rem] transition-all duration-300 ${activeTab === 'tasks' ? 'text-indigo-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
            <span className={`text-2xl transition-transform duration-300 ${activeTab === 'tasks' ? 'scale-110 -translate-y-1' : ''}`}>🎯</span>
            <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Offers</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`relative flex flex-col items-center py-3 px-6 rounded-[2rem] transition-all duration-300 ${activeTab === 'history' ? 'text-indigo-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
            <span className={`text-2xl transition-transform duration-300 ${activeTab === 'history' ? 'scale-110 -translate-y-1' : ''}`}>📋</span>
            <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">History</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`relative flex flex-col items-center py-3 px-6 rounded-[2rem] transition-all duration-300 ${activeTab === 'profile' ? 'text-indigo-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
            <span className={`text-2xl transition-transform duration-300 ${activeTab === 'profile' ? 'scale-110 -translate-y-1' : ''}`}>👤</span>
            <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default UserPanel;
