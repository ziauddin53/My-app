
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { UserProfile, Task, TaskType, Transaction, TransactionType, SystemSettings } from './types';
import LoginForm from './components/LoginForm';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import QuizModal from './components/QuizModal';

const DEFAULT_SETTINGS: SystemSettings = {
  min_withdrawal: 100,
  points_per_taka: 100,
  referral_bonus: 50,
  is_under_maintenance: false,
  is_bkash_enabled: true,
  is_nagad_enabled: true,
  is_recharge_enabled: true,
  is_giftcard_enabled: true,
  is_auto_payout_enabled: true,
  app_notice: "আমাদের অ্যাপে স্বাগতম! নিয়মিত কাজ করুন এবং পুরস্কার জিতুন। যেকোনো সমস্যায় সাপোর্ট সেন্টারে যোগাযোগ করুন।",
  support_link: "https://t.me/your_telegram_channel"
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchAllData();
    }
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single();
      
      setProfile(profileData);

      const { data: taskData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (taskData) setTasks(taskData);

      if (profileData?.role === 'admin') {
        const { data: allUsers } = await supabase.from('profiles').select('*');
        if (allUsers) setUsers(allUsers);
      }

      const { data: txData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (txData) setTransactions(txData);

    } catch (err) {
      console.error("Critical Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (userId === profile?.id) {
      alert("নিরাপত্তার স্বার্থে আপনি নিজের রোল পরিবর্তন করতে পারবেন না!");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert("Role update failed: " + error.message);
      return;
    }

    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    alert(`ইউজার রোল সফলভাবে '${newRole.toUpperCase()}' করা হয়েছে!`);
  };

  const addPoints = async (basePoints: number, percentage: number = 100) => {
    if (!profile || profile.is_blocked) return;
    
    const userAmount = Math.floor((basePoints * percentage) / 100);
    const newPoints = profile.points + userAmount;

    const { error } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, points: newPoints });
      setUsers(users.map(u => u.id === profile.id ? { ...u, points: newPoints } : u));
    }
  };

  const handleAdjustPoints = async (userId: string, pointsDiff: number) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const newPoints = Math.max(0, targetUser.points + pointsDiff);
    const { error } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, points: newPoints } : u));
      if (profile?.id === userId) setProfile({ ...profile, points: newPoints });
    }
  };

  const handleAdjustBalance = async (userId: string, balanceDiff: number) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const newBalance = Math.max(0, targetUser.wallet_balance + balanceDiff);
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, wallet_balance: newBalance } : u));
      if (profile?.id === userId) setProfile({ ...profile, wallet_balance: newBalance });
    }
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (task.id && tasks.find(t => t.id === task.id)) {
      const { error } = await supabase.from('tasks').update(task).eq('id', task.id);
      if (error) return alert("Task Update Failed");
      setTasks(tasks.map(t => t.id === task.id ? { ...t, ...task } as Task : t));
    } else {
      const newTask = { ...task, id: Math.random().toString(36).substr(2, 9), status: 'active' };
      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) return alert("Task Creation Failed");
      setTasks([newTask as Task, ...tasks]);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) return alert("Delete Failed");
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleConvertPoints = async (points: number) => {
    if (!profile) return;
    const cash = points / systemSettings.points_per_taka;
    const newPoints = profile.points - points;
    const newBalance = profile.wallet_balance + cash;

    const newTx: Transaction = {
      id: 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      user_id: profile.id,
      type: TransactionType.CONVERSION,
      amount: cash,
      points: points,
      status: 'completed',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .update({ points: newPoints, wallet_balance: newBalance })
      .eq('id', profile.id);

    if (!error) {
      setTransactions([newTx, ...transactions]);
      setProfile({ ...profile, points: newPoints, wallet_balance: newBalance });
    }
  };

  const handleCashout = async (amount: number, method: 'bkash' | 'nagad' | 'recharge' | 'giftcard', account: string, operator?: string) => {
    if (!profile) return;
    
    const isAuto = systemSettings.is_auto_payout_enabled;
    const newTx: Transaction = {
      id: (isAuto ? 'PAY-' : 'REQ-') + Math.random().toString(36).substr(2, 9).toUpperCase(),
      user_id: profile.id,
      type: TransactionType.CASHOUT,
      amount: amount,
      payment_method: method,
      account_number: account,
      operator: operator,
      status: isAuto ? 'completed' : 'pending',
      created_at: new Date().toISOString()
    };

    const newBalance = profile.wallet_balance - amount;
    
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', profile.id);

    if (!error) {
      setTransactions([newTx, ...transactions]);
      setProfile({ ...profile, wallet_balance: newBalance });
    }
  };

  const handleUpdateTransactionStatus = async (txId: string, status: 'completed' | 'failed') => {
    const tx = transactions.find(t => t.id === txId);
    if (tx && tx.type === TransactionType.CASHOUT && status === 'failed') {
      const targetUser = users.find(u => u.id === tx.user_id);
      if (targetUser) {
        const refundedBalance = targetUser.wallet_balance + tx.amount;
        await supabase.from('profiles').update({ wallet_balance: refundedBalance }).eq('id', tx.user_id);
        setUsers(users.map(u => u.id === tx.user_id ? { ...u, wallet_balance: refundedBalance } : u));
        if (profile?.id === tx.user_id) setProfile({ ...profile, wallet_balance: refundedBalance });
      }
    }

    const { error } = await supabase.from('transactions').update({ status }).eq('id', txId);
    if (!error) {
      setTransactions(transactions.map(t => t.id === txId ? { ...t, status } : t));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(79,70,229,0.3)]"></div>
        <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Neural Network...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginForm onAuthSuccess={fetchAllData} />;
  }

  return (
    <>
      {profile?.role === 'admin' ? (
        <AdminPanel 
          onSignOut={() => supabase.auth.signOut()} 
          tasks={tasks} 
          setTasks={handleSaveTask as any} 
          onDeleteTask={handleDeleteTask}
          adminProfile={profile}
          users={users}
          transactions={transactions}
          systemSettings={systemSettings}
          onUpdateSettings={setSystemSettings}
          onUpdateTxStatus={handleUpdateTransactionStatus}
          onToggleBlock={async (uid) => {
            const user = users.find(u => u.id === uid);
            if (!user) return;
            const { error } = await supabase.from('profiles').update({ is_blocked: !user.is_blocked }).eq('id', uid);
            if (!error) setUsers(users.map(u => u.id === uid ? {...u, is_blocked: !u.is_blocked} : u));
          }}
          onAdjustPoints={handleAdjustPoints}
          onAdjustBalance={handleAdjustBalance}
          onUpdateUserRole={handleUpdateUserRole}
        />
      ) : (
        <UserPanel 
          profile={profile} 
          tasks={tasks.filter(t => t.status === 'active')}
          transactions={transactions.filter(t => t.user_id === profile?.id)}
          systemSettings={systemSettings}
          onTaskClick={(t) => {
            if (profile?.is_blocked) return alert("আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে!");
            if (t.type === TaskType.QUIZ) setShowQuiz(true);
            else {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                addPoints(t.reward_points, t.reward_percentage);
                alert(`${t.reward_points} পয়েন্ট সফলভাবে যোগ হয়েছে!`);
              }, 2500);
            }
          }} 
          onSignOut={() => supabase.auth.signOut()}
          onRefresh={fetchAllData}
          onDailyCheckIn={async () => {
             if (profile?.is_blocked) return;
             const bonus = systemSettings.referral_bonus;
             const newPoints = (profile?.points || 0) + bonus;
             const { error } = await supabase.from('profiles').update({ points: newPoints, last_check_in: new Date().toISOString() }).eq('id', profile?.id);
             if (!error) {
               setProfile({ ...profile!, points: newPoints, last_check_in: new Date().toISOString() });
               alert('দৈনিক বোনাস সফলভাবে যোগ হয়েছে!');
             }
          }}
          onConvert={handleConvertPoints}
          onAutoCashout={handleCashout}
        />
      )}
      {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} onComplete={(pts) => { addPoints(pts, 100); setShowQuiz(false); }} />}
    </>
  );
};

export default App;
