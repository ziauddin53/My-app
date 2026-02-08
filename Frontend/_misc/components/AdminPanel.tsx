
import React, { useState, useEffect } from 'react';
import { UserProfile, Task, TaskType, Transaction, TransactionType, SystemSettings } from '../types';
import { generateTasksWithAI } from '../services/geminiService';
import Logo from './Logo';

interface AdminPanelProps {
  onSignOut: () => void;
  tasks: Task[];
  setTasks: (task: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  adminProfile: UserProfile | null;
  users: UserProfile[];
  transactions: Transaction[];
  systemSettings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onUpdateTxStatus: (id: string, status: 'completed' | 'failed') => void;
  onToggleBlock: (userId: string) => void;
  onAdjustPoints: (userId: string, points: number) => void;
  onAdjustBalance: (userId: string, balance: number) => void;
  onUpdateUserRole: (userId: string, newRole: 'admin' | 'user') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onSignOut, tasks, setTasks, onDeleteTask, adminProfile, users, transactions, systemSettings, onUpdateSettings, onUpdateTxStatus, onToggleBlock, onAdjustPoints, onAdjustBalance, onUpdateUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'users' | 'tasks' | 'settings' | 'ai'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [userModal, setUserModal] = useState<{ isOpen: boolean; user: UserProfile | null }>({ isOpen: false, user: null });
  const [adjustmentValue, setAdjustmentValue] = useState<{ points: string, balance: string, role: 'admin' | 'user' }>({ points: '', balance: '', role: 'user' });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  const [localSettings, setLocalSettings] = useState<SystemSettings>(systemSettings);

  useEffect(() => {
    setLocalSettings(systemSettings);
  }, [systemSettings]);

  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: '',
    reward_points: 100,
    reward_percentage: 80,
    type: TaskType.VIDEO_AD,
    icon: '🎬',
    status: 'active'
  });

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalPoints: users.reduce((acc, u) => acc + u.points, 0),
    totalUsers: users.length,
    completedPayments: transactions.filter(t => t.status === 'completed' && t.type === TransactionType.CASHOUT).length,
    totalPaidAmount: transactions.filter(t => t.status === 'completed' && t.type === TransactionType.CASHOUT).reduce((acc, t) => acc + t.amount, 0),
    totalConvertedPoints: transactions.filter(t => t.type === TransactionType.CONVERSION).reduce((acc, t) => acc + (t.points || 0), 0),
  };

  const handleOpenTaskModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskForm(task);
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        reward_points: 100,
        reward_percentage: 80,
        type: TaskType.VIDEO_AD,
        icon: '🎬',
        status: 'active'
      });
    }
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = () => {
    setTasks(taskForm);
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই মিশনটি মুছে ফেলতে চান? এটি পুনরায় ফিরিয়ে আনা সম্ভব হবে না।')) {
      onDeleteTask(id);
    }
  };

  const handleUserUpdate = () => {
    if (!userModal.user) return;
    const pAdj = parseInt(adjustmentValue.points);
    const bAdj = parseFloat(adjustmentValue.balance);
    
    if (!isNaN(pAdj)) onAdjustPoints(userModal.user.id, pAdj);
    if (!isNaN(bAdj)) onAdjustBalance(userModal.user.id, bAdj);
    
    if (adjustmentValue.role !== userModal.user.role && userModal.user.id !== adminProfile?.id) {
      onUpdateUserRole(userModal.user.id, adjustmentValue.role);
    }
    
    setUserModal({ isOpen: false, user: null });
    setAdjustmentValue({ points: '', balance: '', role: 'user' });
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return alert("একটি টপিক লিখুন!");
    setAiLoading(true);
    try {
      const generated = await generateTasksWithAI(aiTopic);
      if (generated && generated.length > 0) {
        for (const t of generated) {
          setTasks({ ...t, status: 'active' });
        }
        setAiTopic('');
        setActiveTab('tasks');
        alert('AI সাফল্যের সাথে মিশন জেনারেট করেছে!');
      }
    } catch (error) {
      alert("AI ল্যাব সিঙ্ক এরর!");
    } finally {
      setAiLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard label="মোট এডমিন প্রফিট" value={`৳${((adminProfile?.admin_points || 0) / 100).toFixed(2)}`} icon="💰" color="text-indigo-400" />
               <StatCard label="ইউজার সংখ্যা" value={stats.totalUsers.toString()} icon="👥" color="text-purple-400" />
               <StatCard label="সিস্টেম মোট পয়েন্ট" value={stats.totalPoints.toLocaleString()} icon="💎" color="text-amber-400" />
               <StatCard label="মোট পেআউট" value={`৳${stats.totalPaidAmount}`} icon="🚀" color="text-emerald-400" />
            </div>

            <div className="bg-[#0f172a]/50 border border-white/5 p-10 rounded-[3rem] backdrop-blur-md">
               <div className="flex justify-between items-center mb-10">
                  <h4 className="text-xl font-black text-white">📉 পয়েন্ট সার্কুলেশন অ্যানালিটিক্স</h4>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     কনভার্টেড পয়েন্ট: <span className="text-indigo-400">{stats.totalConvertedPoints.toLocaleString()}</span>
                  </div>
               </div>
               <div className="flex items-end space-x-3 h-48">
                  {[40, 70, 45, 90, 65, 35, 95, 55, 80, 50, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group">
                      <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-xl transition-all duration-1000 group-hover:bg-cyan-400" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );
      case 'finance':
        return (
          <div className="bg-[#0f172a]/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl animate-in fade-in duration-500">
             <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-black text-white tracking-tighter">পেমেন্ট লেজার ও রিকোয়েস্ট</h3>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-4 py-2 bg-emerald-500/5 rounded-full border border-emerald-500/20">Transaction Control Center</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase">ইউজার</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase">মেথড / নাম্বার / ডিটেইলস</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase">পরিমাণ</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase">স্ট্যাটাস</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter(t => t.type === TransactionType.CASHOUT).map(tx => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="p-6">
                           <p className="font-bold text-white text-sm">{users.find(u => u.id === tx.user_id)?.email || 'Unknown User'}</p>
                           <p className="text-[9px] text-slate-500 font-mono uppercase">{tx.id}</p>
                        </td>
                        <td className="p-6 font-mono text-xs">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase mr-2 ${
                             tx.payment_method === 'bkash' ? 'bg-pink-500/10 text-pink-500' : 
                             tx.payment_method === 'nagad' ? 'bg-orange-500/10 text-orange-500' :
                             tx.payment_method === 'recharge' ? 'bg-cyan-500/10 text-cyan-500' :
                             'bg-purple-500/10 text-purple-500'
                           }`}>
                             {tx.payment_method}
                           </span>
                           <span className="text-slate-400">
                             {tx.account_number} {tx.operator ? `(${tx.operator})` : ''}
                           </span>
                        </td>
                        <td className="p-6 font-black text-white text-lg">৳{tx.amount}</td>
                        <td className="p-6">
                           <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                             tx.status === 'completed' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 
                             tx.status === 'pending' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 
                             'text-red-500 bg-red-500/10 border-red-500/20'
                           }`}>
                             {tx.status === 'completed' ? 'Paid' : tx.status === 'pending' ? 'Pending Approval' : 'Rejected'}
                           </span>
                        </td>
                        <td className="p-6">
                          {tx.status === 'pending' && (
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => onUpdateTxStatus(tx.id, 'completed')}
                                 className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 transition-all"
                               >
                                 Approve
                               </button>
                               <button 
                                 onClick={() => onUpdateTxStatus(tx.id, 'failed')}
                                 className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-red-500 transition-all"
                               >
                                 Reject
                               </button>
                            </div>
                          )}
                          {tx.status !== 'pending' && (
                            <span className="text-[10px] text-slate-600 font-black uppercase italic tracking-widest">No Action Needed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="relative group w-full md:w-96">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
                <input 
                  type="text" 
                  placeholder="ইউজার সার্চ (Email/Name)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold w-full focus:border-indigo-500 outline-none transition-all text-white"
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredUsers.map(user => (
                 <div key={user.id} className="bg-[#0f172a]/50 border border-white/5 p-8 rounded-[3rem] backdrop-blur-md group hover:border-indigo-500/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">👤</div>
                       <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {user.role === 'admin' ? 'Master Admin' : 'Neural Citizen'}
                       </span>
                    </div>
                    <h4 className="text-xl font-black text-white truncate mb-1">{user.full_name || 'Neural Citizen'}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">{user.email}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="bg-white/5 p-4 rounded-2xl">
                          <p className="text-[9px] text-slate-500 font-black uppercase">Credits</p>
                          <p className="font-black text-indigo-400">{user.points.toLocaleString()}</p>
                       </div>
                       <div className="bg-white/5 p-4 rounded-2xl">
                          <p className="text-[9px] text-slate-500 font-black uppercase">Wallet</p>
                          <p className="font-black text-emerald-400">৳{user.wallet_balance.toFixed(2)}</p>
                       </div>
                    </div>

                    <div className="flex gap-2">
                       <button onClick={() => { setUserModal({ isOpen: true, user }); setAdjustmentValue({ points: '', balance: '', role: user.role }); }} className="flex-1 py-4 bg-indigo-600 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-500 transition-all text-white">ম্যানেজ ইউজার</button>
                       <button onClick={() => onToggleBlock(user.id)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border border-white/10 ${user.is_blocked ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-50 hover:text-red-600'}`}>
                          {user.is_blocked ? '🔓' : '🔒'}
                       </button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white tracking-tighter">মিশন কন্ট্রোল সেন্টার</h3>
                <button 
                  onClick={() => handleOpenTaskModal()} 
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all"
                >
                  + Add New Mission
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tasks.map(task => (
                 <div key={task.id} className="bg-[#0f172a]/50 border border-white/5 p-8 rounded-[3rem] group hover:border-indigo-500 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 flex gap-2">
                       <button onClick={() => handleOpenTaskModal(task)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-indigo-500 flex items-center justify-center text-xs transition-all shadow-lg">✏️</button>
                       <button onClick={() => handleDeleteTask(task.id)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500 flex items-center justify-center text-xs transition-all shadow-lg">🗑️</button>
                    </div>
                    <div className="flex justify-between mb-6">
                       <span className="text-5xl group-hover:rotate-12 transition-transform duration-500">{task.icon}</span>
                       <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full h-fit border ${task.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {task.status}
                       </span>
                    </div>
                    <h4 className="text-xl font-black text-white mb-2 leading-tight">{task.title}</h4>
                    <div className="flex flex-col space-y-1">
                       <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Base Points: {task.reward_points}</div>
                       <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">User Split: {task.reward_percentage}%</div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        );
      case 'ai':
        return (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-in zoom-in duration-500">
             <div className="w-28 h-28 bg-gradient-to-tr from-indigo-500 via-purple-600 to-blue-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-2xl animate-pulse">🤖</div>
             <div>
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">AI মিশন ল্যাব</h2>
                <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest">Powered by Google Gemini-3 Pro</p>
             </div>
             <div className="bg-[#0f172a]/80 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-md shadow-2xl">
                <p className="text-slate-400 text-sm mb-10 font-medium">একটি ক্যাটাগরি লিখুন, AI আপনার জন্য হাই-পেয়িং স্মার্ট মিশন তৈরি করবে।</p>
                <div className="relative mb-8">
                   <input 
                    type="text" 
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Topic (e.g. Sports, Gaming, Web3)..."
                    className="w-full bg-black/40 border border-white/5 p-6 rounded-2xl font-black text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                  />
                </div>
                <button 
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-3"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      সিঙ্ক্রোনাইজিং...
                    </>
                  ) : 'স্মার্ট মিশন জেনারেট করুন'}
                </button>
             </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl animate-in zoom-in duration-500 mx-auto">
             <div className="bg-[#0f172a]/50 border border-white/5 p-8 md:p-12 rounded-[3.5rem] backdrop-blur-md space-y-12 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-black text-white tracking-tighter">গ্লোবাল কন্ট্রোল</h3>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-4 py-2 bg-emerald-500/5 rounded-full border border-emerald-500/20">System-Wide Settings</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-2">পয়েন্ট ও ইকোনমি</h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase px-4">কনভার্সন রেট (৳1 = ? Pts)</label>
                           <input type="number" value={localSettings.points_per_taka} onChange={e => setLocalSettings({...localSettings, points_per_taka: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl font-black text-white outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase px-4">মিনিমাম পেআউট (৳)</label>
                           <input type="number" value={localSettings.min_withdrawal} onChange={e => setLocalSettings({...localSettings, min_withdrawal: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl font-black text-white outline-none focus:border-indigo-500" />
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-2 mt-8">অ্যাপ নোটিশ ও সাপোর্ট</h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase px-4">হোম স্ক্রিন নোটিশ</label>
                           <textarea value={localSettings.app_notice} onChange={e => setLocalSettings({...localSettings, app_notice: e.target.value})} className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 h-24 resize-none" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase px-4">সাপোর্ট লিংক (Telegram/WhatsApp)</label>
                           <input type="text" value={localSettings.support_link} onChange={e => setLocalSettings({...localSettings, support_link: e.target.value})} className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl font-black text-white outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-2">পেমেন্ট গেটওয়ে কন্ট্রোল</h4>
                      <div className="bg-white/5 p-8 rounded-[2.5rem] shadow-sm space-y-6 border border-white/5">
                        <ToggleButton 
                          label="bKash Payout" 
                          enabled={localSettings.is_bkash_enabled} 
                          color="pink"
                          onToggle={() => setLocalSettings({...localSettings, is_bkash_enabled: !localSettings.is_bkash_enabled})} 
                        />
                        <ToggleButton 
                          label="Nagad Payout" 
                          enabled={localSettings.is_nagad_enabled} 
                          color="orange"
                          onToggle={() => setLocalSettings({...localSettings, is_nagad_enabled: !localSettings.is_nagad_enabled})} 
                        />
                        <ToggleButton 
                          label="Mobile Recharge" 
                          enabled={localSettings.is_recharge_enabled} 
                          color="cyan"
                          onToggle={() => setLocalSettings({...localSettings, is_recharge_enabled: !localSettings.is_recharge_enabled})} 
                        />
                        <ToggleButton 
                          label="Gift Card (Play/Amazon)" 
                          enabled={localSettings.is_giftcard_enabled} 
                          color="purple"
                          onToggle={() => setLocalSettings({...localSettings, is_giftcard_enabled: !localSettings.is_giftcard_enabled})} 
                        />
                        <div className="pt-6 border-t border-white/5">
                          <ToggleButton 
                            label="Auto-Payout Mode" 
                            enabled={localSettings.is_auto_payout_enabled} 
                            color="indigo"
                            onToggle={() => setLocalSettings({...localSettings, is_auto_payout_enabled: !localSettings.is_auto_payout_enabled})} 
                          />
                        </div>
                        <div className="pt-4 border-t border-white/5">
                          <ToggleButton 
                            label="Maintenance Mode" 
                            enabled={localSettings.is_under_maintenance} 
                            color="red"
                            onToggle={() => setLocalSettings({...localSettings, is_under_maintenance: !localSettings.is_under_maintenance})} 
                          />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="pt-8">
                  <button 
                    onClick={() => {
                      onUpdateSettings(localSettings);
                      alert('সিস্টেম কনফিগ সফলভাবে আপডেট করা হয়েছে!');
                    }} 
                    className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-500 transition-all text-xs"
                  >
                    💾 Save All Core Settings
                  </button>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      <aside className="w-full md:w-80 bg-[#0f172a] border-r border-white/5 flex flex-col p-8 z-50">
        <div className="mb-12 flex items-center space-x-4">
          <Logo size="md" className="shadow-2xl" />
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter">Zenumama Reward</h2>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Master Admin</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="📊" label="ড্যাশবোর্ড" />
          <NavItem active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon="💸" label="পেমেন্ট গেটওয়ে" />
          <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👤" label="ইউজার কন্ট্রোল" />
          <NavItem active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon="🎯" label="মিশন কন্ট্রোল" />
          <NavItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon="🤖" label="AI মিশন ল্যাব" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" label="সিস্টেম কনফিগ" />
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5">
          <button onClick={onSignOut} className="w-full py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/10 transition-all">
             Terminate Session
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative bg-[#020617]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <header className="mb-12 relative z-10">
           <h1 className="text-5xl font-black text-white tracking-tighter capitalize">
             {activeTab === 'dashboard' ? 'ড্যাশবোর্ড' : 
              activeTab === 'finance' ? 'পেমেন্ট গেটওয়ে' :
              activeTab === 'users' ? 'ইউজার কন্ট্রোল' :
              activeTab === 'tasks' ? 'মিশন কন্ট্রোল' :
              activeTab === 'ai' ? 'AI মিশন ল্যাব' : 'সিস্টেম কনফিগ'}
           </h1>
        </header>
        {renderContent()}
      </main>

      {userModal.isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0f172a] w-full max-w-lg rounded-[3.5rem] p-10 border border-white/10 shadow-2xl animate-in zoom-in">
             <div className="flex items-center space-x-6 mb-10">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-4xl">👤</div>
                <div>
                   <h3 className="text-3xl font-black text-white tracking-tighter">{userModal.user?.full_name || 'Anonymous User'}</h3>
                   <p className="text-slate-500 text-xs font-bold">{userModal.user?.email}</p>
                </div>
             </div>
             
             <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-6 rounded-3xl text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Current Points</p>
                      <p className="text-2xl font-black text-indigo-400">{userModal.user?.points.toLocaleString()}</p>
                   </div>
                   <div className="bg-white/5 p-6 rounded-3xl text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Current Balance</p>
                      <p className="text-2xl font-black text-emerald-400">৳{userModal.user?.wallet_balance.toFixed(2)}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-4">Account Role (Management)</label>
                      <select 
                        value={adjustmentValue.role}
                        disabled={userModal.user?.id === adminProfile?.id}
                        onChange={e => setAdjustmentValue({...adjustmentValue, role: e.target.value as 'admin' | 'user'})}
                        className={`w-full p-6 bg-black/40 border border-white/5 rounded-2xl font-black text-white outline-none focus:border-indigo-500 appearance-none ${userModal.user?.id === adminProfile?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                         <option value="user">সাধারণ ইউজার (User)</option>
                         <option value="admin">ম্যানেজার/এডমিন (Admin)</option>
                      </select>
                      {userModal.user?.id === adminProfile?.id && (
                        <p className="text-[8px] text-red-400 font-bold uppercase px-4 mt-1">নিরাপত্তার স্বার্থে আপনি নিজের রোল পরিবর্তন করতে পারবেন না</p>
                      )}
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-4">পয়েন্ট অ্যাডজাস্টমেন্ট (+/-)</label>
                      <input 
                        type="number" 
                        value={adjustmentValue.points}
                        onChange={e => setAdjustmentValue({...adjustmentValue, points: e.target.value})}
                        placeholder="Ex: 500 or -200"
                        className="w-full p-6 bg-black/40 border border-white/5 rounded-2xl font-black text-white outline-none focus:border-indigo-500" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-4">ব্যালেন্স অ্যাডজাস্টমেন্ট (+/- ৳)</label>
                      <input 
                        type="number" 
                        value={adjustmentValue.balance}
                        onChange={e => setAdjustmentValue({...adjustmentValue, balance: e.target.value})}
                        placeholder="Ex: 10 or -5.50"
                        className="w-full p-6 bg-black/40 border border-white/5 rounded-2xl font-black text-white outline-none focus:border-emerald-500" 
                      />
                   </div>
                </div>

                <button onClick={handleUserUpdate} className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl">Update User Profile</button>
                <button onClick={() => setUserModal({ isOpen: false, user: null })} className="w-full text-slate-500 font-black py-2">বাতিল</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all group ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
  >
    <span className={`text-xl transition-transform group-hover:scale-110 ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className="text-[10px] uppercase tracking-[0.2em] font-black">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, color }: { label: string, value: string, icon: string, color: string }) => (
  <div className="bg-[#0f172a]/50 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group backdrop-blur-md">
    <div className={`absolute -right-6 -bottom-6 text-7xl opacity-5 group-hover:opacity-10 transition-all duration-700`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
    <h3 className={`text-3xl font-black tracking-tighter ${color}`}>{value}</h3>
  </div>
);

const ToggleButton = ({ label, enabled, color, onToggle }: { label: string, enabled: boolean, color: string, onToggle: () => void }) => {
  const colorMap: Record<string, string> = {
    pink: enabled ? 'bg-pink-600' : 'bg-slate-700',
    orange: enabled ? 'bg-orange-600' : 'bg-slate-700',
    cyan: enabled ? 'bg-cyan-600' : 'bg-slate-700',
    purple: enabled ? 'bg-purple-600' : 'bg-slate-700',
    red: enabled ? 'bg-red-600' : 'bg-slate-700',
    indigo: enabled ? 'bg-indigo-600' : 'bg-slate-700',
  };

  return (
    <div className="flex items-center justify-between group">
       <div>
          <p className={`text-sm font-black ${
            color === 'pink' ? 'text-pink-500' : 
            color === 'orange' ? 'text-orange-500' : 
            color === 'cyan' ? 'text-cyan-500' : 
            color === 'purple' ? 'text-purple-500' : 
            color === 'red' ? 'text-red-500' : 'text-indigo-400'
          }`}>{label}</p>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Gateway Status: {enabled ? 'Active' : 'Offline'}</p>
       </div>
       <button 
          onClick={onToggle}
          className={`w-14 h-7 rounded-full transition-all flex items-center px-1 shadow-lg ${colorMap[color]}`}
       >
          <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${enabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
       </button>
    </div>
  );
};

export default AdminPanel;
