
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, points, role')
        .order('points', { ascending: false })
        .limit(5);

      if (data) setTopUsers(data as UserProfile[]);
    } catch (err) {
      console.error("Leaderboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Syncing Neural Rank...</div>;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm mb-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">🏆 টপ আর্নার্স (Realtime)</h3>
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">All Time</span>
      </div>
      <div className="space-y-4">
        {topUsers.length === 0 ? (
            <p className="text-center text-slate-400 text-[10px] py-4 font-bold">এখনো কোনো ডাটা নেই</p>
        ) : topUsers.map((user, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-100 transition-all">
            <div className="flex items-center space-x-4">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                {idx + 1}
              </span>
              <span className="font-bold text-slate-700">{user.full_name || 'Anonymous User'}</span>
            </div>
            <span className="font-black text-slate-900">{user.points.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">pts</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
